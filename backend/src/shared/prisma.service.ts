import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, ProductKind, SizeKey } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.seedCuttingRules();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedCuttingRules() {
    const count = await this.cuttingRule.count();
    if (count > 0) {
      // One-time correction for WINGBACK rules (ensure correct set and dimensions)
      // Desired per-wing rules: 2×(1520×210), 1×(1520×80), 1×(210×80)
      const existingWing = await this.cuttingRule.findMany({ where: { department: 'MATERIALS', productKind: ProductKind.WINGBACK } });
      const needFix = existingWing.length === 0 || (existingWing.some(r => (r.width === 210 && r.height === 80)) && existingWing.filter(r => r.width === 1520 && r.height === 80).length === 0);
      if (needFix) {
        await this.cuttingRule.deleteMany({ where: { department: 'MATERIALS', productKind: ProductKind.WINGBACK } });
        await this.cuttingRule.createMany({ data: [
          { department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 1520, height: 210, quantityPer: 2, note: 'wing' },
          { department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 1520, height: 80, quantityPer: 1, note: 'wing' },
          { department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 210, height: 80, quantityPer: 1, note: 'wing' },
        ]});
      }
      return;
    }

    // Seed Materials department cutting rules per user specification
    const rules: Array<Parameters<typeof this.cuttingRule.create>[0]['data']> = [];

    // Bella front per size (VELVET placeholder to be replaced by selected fabric)
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'VELVET', width: 1450, height: 1200, quantityPer: 1, note: 'front piece' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'VELVET', width: 1450, height: 1111, quantityPer: 1, note: 'front piece' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'VELVET', width: 1450, height: 920, quantityPer: 1, note: 'front piece' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'VELVET', width: 1450, height: 750, quantityPer: 1, note: 'front piece' });
    // Bella bottom fabric (all sizes)
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.ANY, material: 'VELVET', width: 700, height: 200, quantityPer: 1, note: 'bottom piece' });

    // Panel segments per size
    // Queen
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'VELVET', width: 380, height: 106, quantityPer: 2, note: 'panel' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'VELVET', width: 310, height: 106, quantityPer: 6, note: 'panel' });
    // Double
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'VELVET', width: 380, height: 106, quantityPer: 2, note: 'panel' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'VELVET', width: 310, height: 106, quantityPer: 6, note: 'panel' });
    // 3/4
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'VELVET', width: 380, height: 106, quantityPer: 2, note: 'panel' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'VELVET', width: 340, height: 106, quantityPer: 6, note: 'panel' });
    // Single
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'VELVET', width: 380, height: 106, quantityPer: 2, note: 'panel' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'VELVET', width: 310, height: 106, quantityPer: 6, note: 'panel' });
    // Panel bottom
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.ANY, material: 'VELVET', width: 700, height: 200, quantityPer: 1, note: 'bottom piece' });

    // Spunbond (shared for Bella/Panel)
    // Bella spunbond
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'SPUNBOND', width: 1420, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'SPUNBOND', width: 1530, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'SPUNBOND', width: 1290, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'SPUNBOND', width: 1530, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'SPUNBOND', width: 1050, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'SPUNBOND', width: 1250, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'SPUNBOND', width: 880, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'SPUNBOND', width: 1250, height: 1600, quantityPer: 1, note: 'spunbond back' });
    // Panel spunbond
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'SPUNBOND', width: 1420, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'SPUNBOND', width: 1530, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'SPUNBOND', width: 1290, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'SPUNBOND', width: 1530, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'SPUNBOND', width: 1050, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'SPUNBOND', width: 1250, height: 1600, quantityPer: 1, note: 'spunbond back' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'SPUNBOND', width: 880, height: 700, quantityPer: 1, note: 'spunbond bottom' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'SPUNBOND', width: 1250, height: 1600, quantityPer: 1, note: 'spunbond back' });

    // Wingback add-on (fabric) per-wing counts
    rules.push({ department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 1520, height: 210, quantityPer: 2, note: 'wing' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 1520, height: 80, quantityPer: 1, note: 'wing' });
    rules.push({ department: 'MATERIALS', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'VELVET', width: 210, height: 80, quantityPer: 1, note: 'wing' });

    await this.$transaction(rules.map((data) => this.cuttingRule.create({ data })));
  }
}
