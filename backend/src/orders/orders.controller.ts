import { Controller, Post, Body, Get, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() body: { dueDate: string; items: Array<any> }) {
    return this.ordersService.createOrder(body);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deleteOrder(id);
  }

  @Post(':id/regenerate-slips')
  regenerate(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.regenerateSlips(id);
  }
}
