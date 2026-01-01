import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(payload: { dueDate: string; items: Array<any> }) {
    const due = new Date(payload.dueDate);
    // create order first
    const order = await this.prisma.order.create({ data: { dueDate: due } });

    for (const it of payload.items) {
      // skip items that are not actually ordered
      if (!it.quantity || it.quantity <= 0) {
        continue;
      }
      // ensure size/fabric/color exist if names provided
      let sizeId: number | undefined = undefined;
      if (it.sizeName) {
        const s = await this.prisma.size.upsert({ where: { name: it.sizeName }, update: {}, create: { name: it.sizeName } });
        sizeId = s.id;
      }

      let fabricId: number | undefined = undefined;
      if (it.fabricName) {
        const f = await this.prisma.fabric.upsert({ where: { name: it.fabricName }, update: {}, create: { name: it.fabricName } });
        fabricId = f.id;
      }

      let colorId: number | undefined = undefined;
      if (fabricId && it.colorName) {
        const c = await this.prisma.color.findFirst({ where: { name: it.colorName, fabricId } });
        if (!c) {
          const nc = await this.prisma.color.create({ data: { name: it.colorName, fabricId } });
          colorId = nc.id;
        } else {
          colorId = c.id;
        }
      }

      await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: it.productId,
          sizeId,
          fabricId,
          colorId,
          quantity: it.quantity,
        },
      });
    }

    return this.prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  }

  findAll() {
    return this.prisma.order.findMany({ include: { items: { where: { quantity: { gt: 0 } }, include: { product: true, size: true, fabric: { include: { colors: true } }, color: true } } } });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id }, include: { items: { where: { quantity: { gt: 0 } }, include: { product: true, size: true, fabric: { include: { colors: true } }, color: true } } } });
  }

  async deleteOrder(id: number) {
    // Delete child records first due to referential integrity
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    // Then delete the order
    return this.prisma.order.delete({ where: { id } });
  }
}
