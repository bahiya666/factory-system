import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { Inventory, SupplierProduct } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Get all inventory items with low stock alerts
  async getAllInventory(): Promise<(Inventory & { product: SupplierProduct & { supplier: any } })[]> {
    return this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
  }

  // Get low stock items
  async getLowStockItems(): Promise<(Inventory & { product: SupplierProduct & { supplier: any } })[]> {
    const allInventory = await this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    return allInventory.filter(
      (item) =>
        item.product.lowStockThreshold && item.quantity < item.product.lowStockThreshold
    );
  }

  // Get inventory by supplier
  async getInventoryBySupplier(supplierId: number): Promise<(Inventory & { product: SupplierProduct })[]> {
    return this.prisma.inventory.findMany({
      where: {
        product: {
          supplierId,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        quantity: 'desc',
      },
    });
  }

  // Dispatch functionality for reducing stock
  async dispatchProduct(productId: number, quantity: number, reason?: string): Promise<Inventory> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!inventory) {
      throw new NotFoundException(`Product with ID ${productId} not found in inventory`);
    }

    if (inventory.quantity < quantity) {
      throw new BadRequestException(`Not enough stock. Available: ${inventory.quantity}, Requested: ${quantity}`);
    }

    const newQuantity = inventory.quantity - quantity;
    
    // Update inventory
    const updatedInventory = await this.prisma.inventory.update({
      where: { productId },
      data: { quantity: newQuantity },
      include: { product: true },
    });

    // Log the dispatch (you could create a DispatchLog table for this)
    console.log(`Dispatched ${quantity} units of product ${productId}. New quantity: ${newQuantity}. Reason: ${reason || 'No reason provided'}`);

    return updatedInventory;
  }

  // Batch dispatch for multiple products
  async batchDispatch(items: Array<{ productId: number; quantity: number; reason?: string }>): Promise<Array<{ productId: number; success: boolean; message?: string }>> {
    const results: Array<{ productId: number; success: boolean; message?: string }> = [];

    for (const item of items) {
      try {
        await this.dispatchProduct(item.productId, item.quantity, item.reason);
        results.push({ productId: item.productId, success: true });
      } catch (error) {
        results.push({ 
          productId: item.productId, 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }
  async updateInventoryQuantity(
    productId: number,
    quantity: number,
    operation: 'add' | 'subtract' | 'set' = 'set'
  ): Promise<Inventory> {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!existingInventory) {
      throw new NotFoundException(`Inventory item for product ${productId} not found`);
    }

    let newQuantity: number;
    switch (operation) {
      case 'add':
        newQuantity = existingInventory.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, existingInventory.quantity - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }

    return this.prisma.inventory.update({
      where: { productId },
      data: { quantity: newQuantity },
      include: { product: true },
    });
  }

  // Get inventory analytics
  async getInventoryAnalytics(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    topSuppliers: Array<{
      supplierName: string;
      totalItems: number;
      totalValue: number;
    }>;
    recentMovements: Array<{
      productName: string;
      quantity: number;
      timestamp: Date;
      type: 'purchase' | 'dispatch';
    }>;
  }> {
    const allInventory = await this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
            purchases: {
              include: { payments: true },
              orderBy: { dateBought: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    const totalItems = allInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = allInventory.reduce(
      (sum, item) => sum + item.quantity * item.product.unitCost,
      0
    );

    const lowStockItems = allInventory.filter(
      (item) =>
        item.product.lowStockThreshold && item.quantity < item.product.lowStockThreshold
    );
    const lowStockCount = lowStockItems.length;

    const outOfStockCount = allInventory.filter((item) => item.quantity === 0).length;

    // Calculate top suppliers
    const supplierMap = new Map();
    allInventory.forEach((item) => {
      const supplierName = item.product.supplier.name;
      const existing = supplierMap.get(supplierName) || { totalItems: 0, totalValue: 0 };
      supplierMap.set(supplierName, {
        totalItems: existing.totalItems + item.quantity,
        totalValue: existing.totalValue + item.quantity * item.product.unitCost,
      });
    });

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplierName, data]) => ({ supplierName, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Get recent movements (simplified - would need movement tracking table for full implementation)
    const recentMovements = allInventory
      .flatMap((item) =>
        item.product.purchases.map((purchase) => ({
          productName: item.product.name,
          quantity: purchase.quantity,
          timestamp: purchase.dateBought,
          type: 'purchase' as const,
        }))
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      topSuppliers,
      recentMovements,
    };
  }

  // Search inventory
  async searchInventory(query: string): Promise<(Inventory & { product: SupplierProduct & { supplier: any } })[]> {
    return this.prisma.inventory.findMany({
      where: {
        OR: [
          {
            product: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            product: {
              supplier: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            product: {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
  }

  // Create inventory item (usually called when new product is added)
  async createInventoryItem(productId: number, initialQuantity: number = 0): Promise<Inventory> {
    // Check if inventory already exists
    const existing = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (existing) {
      throw new Error(`Inventory item for product ${productId} already exists`);
    }

    return this.prisma.inventory.create({
      data: {
        productId,
        quantity: initialQuantity,
      },
      include: { product: true },
    });
  }

  // Delete inventory item
  async deleteInventoryItem(productId: number): Promise<void> {
    try {
      await this.prisma.inventory.delete({
        where: { productId },
      });
    } catch (error) {
      throw new NotFoundException(`Inventory item for product ${productId} not found`);
    }
  }

  // Get inventory value by supplier
  async getInventoryValueBySupplier(): Promise<Array<{
    supplierId: number;
    supplierName: string;
    totalValue: number;
    totalItems: number;
  }>> {
    const inventory = await this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    const supplierMap = new Map();
    inventory.forEach((item) => {
      const supplierId = item.product.supplierId;
      const supplierName = item.product.supplier.name;
      const value = item.quantity * item.product.unitCost;
      
      const existing = supplierMap.get(supplierId) || { totalValue: 0, totalItems: 0, supplierName };
      supplierMap.set(supplierId, {
        totalValue: existing.totalValue + value,
        totalItems: existing.totalItems + item.quantity,
        supplierName,
      });
    });

    return Array.from(supplierMap.entries()).map(([supplierId, data]) => ({
      supplierId,
      ...data,
    }));
  }
}
