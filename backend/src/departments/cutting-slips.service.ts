import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class CuttingSlipsService {
  constructor(private prisma: PrismaService) {}

  async getFabricCuttingSlip(params: { orderId?: number }) {
    if (params.orderId) {
      const slip = await this.prisma.cuttingSlip.findFirst({
        where: { orderId: params.orderId, department: 'MATERIALS' },
        include: { pieces: { include: { color: true } }, order: true },
      });
      if (!slip) throw new BadRequestException('Cutting slip not found for this order');
      return {
        department: 'MATERIALS',
        type: 'FABRIC_CUTTING_SLIP',
        scope: { orderId: params.orderId, dueDate: slip.order?.dueDate ?? null },
        pieces: slip.pieces
          .map((p) => ({ material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined, color: p.color?.name || null }))
          .sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
        readOnly: true,
      };
    }

    // Aggregate across all MATERIALS slips
    const slips = await this.prisma.cuttingSlip.findMany({ where: { department: 'MATERIALS' }, include: { pieces: { include: { color: true } } } });
    const map = new Map<string, { material: string; width: number; height: number; quantity: number; note?: string; color?: string | null }>();
    for (const s of slips) {
      for (const p of s.pieces) {
        const k = `${p.material}|${p.width}|${p.height}|${p.note ?? ''}|${p.colorId ?? ''}`;
        const prev = map.get(k);
        if (prev) prev.quantity += p.quantity;
        else map.set(k, { material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined, color: p.color?.name || null });
      }
    }
    return {
      department: 'MATERIALS',
      type: 'FABRIC_CUTTING_SLIP',
      scope: { allOrders: true },
      pieces: Array.from(map.values()).sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
      readOnly: true,
    };
  }

  async getWoodCuttingSlip(params: { orderId?: number }) {
    if (params.orderId) {
      const slip = await this.prisma.cuttingSlip.findFirst({
        where: { orderId: params.orderId, department: 'WOOD' },
        include: { pieces: true, order: true },
      });
      if (!slip) throw new BadRequestException('Cutting slip not found for this order');
      return {
        department: 'WOOD',
        type: 'WOOD_CUTTING_SLIP',
        scope: { orderId: params.orderId, dueDate: slip.order?.dueDate ?? null },
        pieces: slip.pieces
          .map((p) => ({ material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined }))
          .sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
        readOnly: true,
      };
    }

    const slips = await this.prisma.cuttingSlip.findMany({ where: { department: 'WOOD' }, include: { pieces: true } });
    const map = new Map<string, { material: string; width: number; height: number; quantity: number; note?: string }>();
    for (const s of slips) {
      for (const p of s.pieces) {
        const k = `${p.material}|${p.width}|${p.height}|${p.note ?? ''}`;
        const prev = map.get(k);
        if (prev) prev.quantity += p.quantity;
        else map.set(k, { material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined });
      }
    }
    return {
      department: 'WOOD',
      type: 'WOOD_CUTTING_SLIP',
      scope: { allOrders: true },
      pieces: Array.from(map.values()).sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
      readOnly: true,
    };
  }

  async getFoamCuttingSlip(params: { orderId?: number }) {
    if (params.orderId) {
      const slip = await this.prisma.cuttingSlip.findFirst({
        where: { orderId: params.orderId, department: 'FOAM' },
        include: { pieces: true, order: true },
      });
      if (!slip) throw new BadRequestException('Cutting slip not found for this order');
      return {
        department: 'FOAM',
        type: 'FOAM_CUTTING_SLIP',
        scope: { orderId: params.orderId, dueDate: slip.order?.dueDate ?? null },
        pieces: slip.pieces
          .map((p) => ({ material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined }))
          .sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
        readOnly: true,
      };
    }

    const slips = await this.prisma.cuttingSlip.findMany({ where: { department: 'FOAM' }, include: { pieces: true } });
    const map = new Map<string, { material: string; width: number; height: number; quantity: number; note?: string }>();
    for (const s of slips) {
      for (const p of s.pieces) {
        const k = `${p.material}|${p.width}|${p.height}|${p.note ?? ''}`;
        const prev = map.get(k);
        if (prev) prev.quantity += p.quantity;
        else map.set(k, { material: p.material, width: p.width, height: p.height, quantity: p.quantity, note: p.note || undefined });
      }
    }
    return {
      department: 'FOAM',
      type: 'FOAM_CUTTING_SLIP',
      scope: { allOrders: true },
      pieces: Array.from(map.values()).sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width || a.height - b.height),
      readOnly: true,
    };
  }
}
