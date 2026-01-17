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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('ADMIN', 'DEPARTMENT')
  findAll() {
    return this.inventoryService.getAllInventory();
  }

  @Get('low-stock')
  @Roles('ADMIN', 'DEPARTMENT')
  getLowStock() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('supplier/:supplierId')
  @Roles('ADMIN', 'DEPARTMENT')
  getBySupplier(@Param('supplierId') supplierId: string) {
    return this.inventoryService.getInventoryBySupplier(+supplierId);
  }

  @Get('analytics')
  @Roles('ADMIN')
  getAnalytics() {
    return this.inventoryService.getInventoryAnalytics();
  }

  @Get('value-by-supplier')
  @Roles('ADMIN')
  getValueBySupplier() {
    return this.inventoryService.getInventoryValueBySupplier();
  }

  @Get('search')
  @Roles('ADMIN', 'DEPARTMENT')
  search(@Query('q') query: string) {
    return this.inventoryService.searchInventory(query);
  }

  @Patch(':productId/quantity')
  @Roles('ADMIN', 'DEPARTMENT')
  updateQuantity(
    @Param('productId') productId: string,
    @Body() updateDto: {
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
    }
  ) {
    return this.inventoryService.updateInventoryQuantity(
      +productId,
      updateDto.quantity,
      updateDto.operation
    );
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createDto: { productId: number; initialQuantity?: number }) {
    return this.inventoryService.createInventoryItem(
      createDto.productId,
      createDto.initialQuantity || 0
    );
  }

  @Delete(':productId')
  @Roles('ADMIN', 'DEPARTMENT')
  remove(@Param('productId') productId: string) {
    return this.inventoryService.deleteInventoryItem(+productId);
  }

  // Dispatch endpoints
  @Post(':productId/dispatch')
  @Roles('ADMIN', 'DEPARTMENT')
  dispatchProduct(
    @Param('productId') productId: string,
    @Body() dispatchDto: {
      quantity: number;
      reason?: string;
    }
  ) {
    return this.inventoryService.dispatchProduct(+productId, dispatchDto.quantity, dispatchDto.reason);
  }

  @Post('batch-dispatch')
  @Roles('ADMIN', 'DEPARTMENT')
  batchDispatch(@Body() batchDto: {
    items: Array<{ productId: number; quantity: number; reason?: string }>;
  }) {
    return this.inventoryService.batchDispatch(batchDto.items);
  }
}
