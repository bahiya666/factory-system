import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // Supplier CRUD endpoints
  @Post()
  @Roles('ADMIN')
  create(@Body() createSupplierDto: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) {
    return this.suppliersService.createSupplier(createSupplierDto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.suppliersService.getSupplierById(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateSupplierDto: {
    name?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) {
    return this.suppliersService.updateSupplier(+id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(+id);
  }

  // Supplier Product endpoints
  @Post(':supplierId/products')
  @Roles('ADMIN')
  createProduct(@Param('supplierId') supplierId: string, @Body() createProductDto: {
    name: string;
    description?: string;
    unitCost: number;
    lowStockThreshold?: number;
  }) {
    return this.suppliersService.createSupplierProduct({
      ...createProductDto,
      supplierId: +supplierId,
    });
  }

  @Get(':supplierId/products')
  @Roles('ADMIN')
  getProducts(@Param('supplierId') supplierId: string) {
    return this.suppliersService.getSupplierProducts(+supplierId);
  }

  @Patch('products/:productId')
  @Roles('ADMIN')
  updateProduct(@Param('productId') productId: string, @Body() updateProductDto: {
    name?: string;
    description?: string;
    unitCost?: number;
    lowStockThreshold?: number;
  }) {
    return this.suppliersService.updateSupplierProduct(+productId, updateProductDto);
  }

  @Delete('products/:productId')
  @Roles('ADMIN')
  removeProduct(@Param('productId') productId: string) {
    return this.suppliersService.deleteSupplierProduct(+productId);
  }

  // Purchase endpoints
  @Post('purchases')
  @Roles('ADMIN')
  createPurchase(@Body() createPurchaseDto: {
    productId: number;
    supplierId: number;
    quantity: number;
    unitPrice: number;
    dateBought: string;
    lastsUntil?: string;
  }) {
    return this.suppliersService.createPurchase({
      ...createPurchaseDto,
      dateBought: new Date(createPurchaseDto.dateBought),
      lastsUntil: createPurchaseDto.lastsUntil ? new Date(createPurchaseDto.lastsUntil) : undefined,
    });
  }

  @Get('purchases')
  @Roles('ADMIN')
  getPurchases(@Query('supplierId') supplierId?: string) {
    return this.suppliersService.getPurchases(supplierId ? +supplierId : undefined);
  }

  @Get('purchases/:id')
  @Roles('ADMIN')
  getPurchase(@Param('id') id: string) {
    return this.suppliersService.getPurchaseById(+id);
  }

  // Payment endpoints
  @Post('purchases/:purchaseId/payments')
  @Roles('ADMIN')
  addPayment(@Param('purchaseId') purchaseId: string, @Body() paymentDto: {
    amountPaid: number;
    notes?: string;
  }) {
    return this.suppliersService.addPayment({
      ...paymentDto,
      purchaseId: +purchaseId,
    });
  }

  @Get('purchases/:purchaseId/payments')
  @Roles('ADMIN')
  getPayments(@Param('purchaseId') purchaseId: string) {
    return this.suppliersService.getPayments(+purchaseId);
  }

  // Analytics endpoints
  @Get(':id/balance')
  @Roles('ADMIN')
  getBalance(@Param('id') id: string) {
    return this.suppliersService.getSupplierBalance(+id);
  }

  @Get(':id/analytics')
  @Roles('ADMIN')
  getAnalytics(@Param('id') id: string) {
    return this.suppliersService.getSupplierAnalytics(+id);
  }
}
