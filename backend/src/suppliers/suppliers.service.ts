import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { Supplier, SupplierProduct, Purchase, Payment } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // Supplier CRUD operations
  async createSupplier(data: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Promise<Supplier> {
    return this.prisma.supplier.create({
      data,
      include: { products: true, purchases: true },
    });
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      include: { 
        products: true, 
        purchases: { 
          include: { payments: true },
          orderBy: { dateBought: 'desc' }
        } 
      },
      orderBy: { name: 'asc' }
    });
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { 
        products: true, 
        purchases: { 
          include: { payments: true },
          orderBy: { dateBought: 'desc' }
        } 
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async updateSupplier(id: number, data: Partial<{
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>): Promise<Supplier> {
    try {
      return await this.prisma.supplier.update({
        where: { id },
        data,
        include: { products: true, purchases: true },
      });
    } catch (error) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    try {
      await this.prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
  }

  // Supplier Product CRUD operations
  async createSupplierProduct(data: {
    name: string;
    description?: string;
    unitCost: number;
    supplierId: number;
    lowStockThreshold?: number;
  }): Promise<SupplierProduct> {
    return this.prisma.supplierProduct.create({
      data,
      include: { supplier: true, inventory: true },
    });
  }

  async getSupplierProducts(supplierId: number): Promise<SupplierProduct[]> {
    return this.prisma.supplierProduct.findMany({
      where: { supplierId },
      include: { supplier: true, inventory: true },
      orderBy: { name: 'asc' }
    });
  }

  async updateSupplierProduct(id: number, data: Partial<{
    name: string;
    description: string;
    unitCost: number;
    lowStockThreshold: number;
  }>): Promise<SupplierProduct> {
    try {
      return await this.prisma.supplierProduct.update({
        where: { id },
        data,
        include: { supplier: true, inventory: true },
      });
    } catch (error) {
      throw new NotFoundException(`Supplier product with ID ${id} not found`);
    }
  }

  async deleteSupplierProduct(id: number): Promise<void> {
    try {
      await this.prisma.supplierProduct.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Supplier product with ID ${id} not found`);
    }
  }

  // Purchase operations
  async createPurchase(data: {
    productId: number;
    supplierId: number;
    quantity: number;
    unitPrice: number;
    dateBought: Date;
    lastsUntil?: Date;
  }): Promise<Purchase> {
    const totalPrice = data.quantity * data.unitPrice;
    
    return this.prisma.$transaction(async (tx) => {
      // Create purchase
      const purchase = await tx.purchase.create({
        data: {
          ...data,
          totalPrice,
        },
        include: { product: true, supplier: true, payments: true },
      });

      // Update inventory
      await this.updateInventory(tx, data.productId, data.quantity);

      return purchase;
    });
  }

  async getPurchases(supplierId?: number): Promise<Purchase[]> {
    const where = supplierId ? { supplierId } : {};
    
    return this.prisma.purchase.findMany({
      where,
      include: { 
        product: { include: { supplier: true } }, 
        supplier: true, 
        payments: true 
      },
      orderBy: { dateBought: 'desc' }
    });
  }

  async getPurchaseById(id: number): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { 
        product: { include: { supplier: true } }, 
        supplier: true, 
        payments: true 
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
    return purchase;
  }

  // Payment operations
  async addPayment(data: {
    purchaseId: number;
    amountPaid: number;
    notes?: string;
  }): Promise<Payment> {
    try {
      return await this.prisma.payment.create({
        data,
        include: { purchase: { include: { supplier: true, product: true } } },
      });
    } catch (error) {
      throw new NotFoundException(`Purchase with ID ${data.purchaseId} not found`);
    }
  }

  async getPayments(purchaseId?: number): Promise<Payment[]> {
    const where = purchaseId ? { purchaseId } : {};
    
    return this.prisma.payment.findMany({
      where,
      include: { 
        purchase: { include: { supplier: true, product: true } } 
      },
      orderBy: { paymentDate: 'desc' }
    });
  }

  // Analytics methods
  async getSupplierBalance(supplierId: number): Promise<{
    totalPurchased: number;
    totalPaid: number;
    balanceOwed: number;
  }> {
    const purchases = await this.prisma.purchase.findMany({
      where: { supplierId },
      include: { payments: true },
    });

    const totalPurchased = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalPaid = purchases.reduce((sum, p) => 
      sum + p.payments.reduce((paymentSum, payment) => paymentSum + payment.amountPaid, 0), 0
    );

    return {
      totalPurchased,
      totalPaid,
      balanceOwed: totalPurchased - totalPaid,
    };
  }

  async getSupplierAnalytics(supplierId: number): Promise<{
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    topProducts: Array<{ productName: string; quantity: number; value: number }>;
    recentActivity: Purchase[];
  }> {
    const purchases = await this.prisma.purchase.findMany({
      where: { supplierId },
      include: { 
        product: true,
        payments: true 
      },
      orderBy: { dateBought: 'desc' },
      take: 50, // Limit for recent activity
    });

    const totalOrders = purchases.length;
    const totalValue = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    // Calculate top products
    const productMap = new Map();
    purchases.forEach(purchase => {
      const existing = productMap.get(purchase.product.name) || { quantity: 0, value: 0 };
      productMap.set(purchase.product.name, {
        quantity: existing.quantity + purchase.quantity,
        value: existing.value + purchase.totalPrice,
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([productName, data]) => ({ productName, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalOrders,
      totalValue,
      averageOrderValue,
      topProducts,
      recentActivity: purchases.slice(0, 10),
    };
  }

  private async updateInventory(prismaClient: any, productId: number, quantity: number): Promise<void> {
    const existingInventory = await prismaClient.inventory.findUnique({
      where: { productId },
    });

    if (existingInventory) {
      await prismaClient.inventory.update({
        where: { productId },
        data: {
          quantity: existingInventory.quantity + quantity,
        },
      });
    } else {
      await prismaClient.inventory.create({
        data: {
          productId,
          quantity,
        },
      });
    }
  }
}
