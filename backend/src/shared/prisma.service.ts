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

      // Ensure WOOD department rules exist even if MATERIALS were already seeded earlier
      const woodCount = await this.cuttingRule.count({ where: { department: 'WOOD' } });
      if (woodCount === 0) {
        await this.cuttingRule.createMany({
          data: [
            // PANEL headboard – Queen
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1560, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 855, height: 23, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1000, height: 10, quantityPer: 2, note: 'offcut' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'CHIPBOARD', width: 199, height: 900, quantityPer: 8, note: 'panel' },

            // PANEL headboard – Double
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1410, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 855, height: 23, quantityPer: 4, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1000, height: 10, quantityPer: 2, note: 'offcut' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'CHIPBOARD', width: 206, height: 900, quantityPer: 7, note: 'panel' },

            // PANEL headboard – 3/4
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1060, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 855, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 600, height: 10, quantityPer: 2, note: 'offcut' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'CHIPBOARD', width: 219, height: 900, quantityPer: 5, note: 'panel' },

            // PANEL headboard – Single
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 960, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 855, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 600, height: 10, quantityPer: 2, note: 'offcut' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'CHIPBOARD', width: 199, height: 900, quantityPer: 5, note: 'panel' },

            // BELLA headboard – Queen
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1560, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 790, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 750, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'MASONITE', width: 1600, height: 900, quantityPer: 1, note: 'back' },

            // BELLA headboard – Double
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1410, height: 33, quantityPer: 4, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 730, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 660, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'MASONITE', width: 1450, height: 875, quantityPer: 1, note: 'back' },

            // BELLA headboard – 3/4
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1160, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 590, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 545, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'MASONITE', width: 1200, height: 875, quantityPer: 1, note: 'back' },

            // BELLA headboard – Single
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 960, height: 33, quantityPer: 3, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 490, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 445, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' },
            { department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'MASONITE', width: 1000, height: 875, quantityPer: 1, note: 'back' },

            // WINGBACK add-on (wood) per-wing counts; each headboard has two wings
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'CHIPBOARD', width: 1450, height: 50, quantityPer: 2, note: 'wing (12mm)' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 110, height: 110, quantityPer: 4, note: 'wing' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 105, height: 50, quantityPer: 5, note: 'wing' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'POLYPROP', width: 1690, height: 40, quantityPer: 1, note: 'wing' },
          ]
        });
      }

      // Ensure WOOD wingback rules exist even if other WOOD rules were already present
      const woodWingCount = await this.cuttingRule.count({ where: { department: 'WOOD', productKind: ProductKind.WINGBACK } });
      if (woodWingCount === 0) {
        await this.cuttingRule.createMany({
          data: [
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'CHIPBOARD', width: 1450, height: 50, quantityPer: 2, note: 'wing (12mm)' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 110, height: 110, quantityPer: 4, note: 'wing' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 105, height: 50, quantityPer: 5, note: 'wing' },
            { department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'POLYPROP', width: 1690, height: 40, quantityPer: 1, note: 'wing' },
          ]
        });
      }

      // Ensure FOAM department rules exist
      const foamCount = await this.cuttingRule.count({ where: { department: 'FOAM' } });
      if (foamCount === 0) {
        await this.cuttingRule.createMany({ data: [
          // BELLA foam per size
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: '40mm White', width: 1590, height: 875, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: '20mm White', width: 1640, height: 910, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: '40mm White', width: 1440, height: 875, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: '20mm White', width: 1470, height: 910, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: '40mm White', width: 1190, height: 875, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: '20mm White', width: 1220, height: 910, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: '40mm White', width: 990, height: 875, quantityPer: 1, note: 'sponge' },
          { department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: '20mm White', width: 1020, height: 910, quantityPer: 1, note: 'sponge' },

          // PANEL foam segments per size
          { department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: '40mm White', width: 215, height: 920, quantityPer: 8, note: 'sponge panel' },
          { department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: '40mm White', width: 222, height: 920, quantityPer: 7, note: 'sponge panel' },
          { department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: '40mm White', width: 255, height: 920, quantityPer: 5, note: 'sponge panel' },
          { department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: '40mm White', width: 215, height: 920, quantityPer: 5, note: 'sponge panel' },

          // WINGBACK (per-wing) foam
          { department: 'FOAM', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: '10mm White', width: 1515, height: 280, quantityPer: 1, note: 'wing' },
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

    // ---------------- WOOD Department (FRAME & PANELS)
    // Default material is PINE unless specified as CHIPBOARD or MASONITE ----------------
    // PANEL headboard – Queen
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1560, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 855, height: 23, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1000, height: 10, quantityPer: 2, note: 'offcut' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: 'CHIPBOARD', width: 199, height: 900, quantityPer: 8, note: 'panel' });

    // PANEL headboard – Double
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1410, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 855, height: 23, quantityPer: 4, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1000, height: 10, quantityPer: 2, note: 'offcut' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: 'CHIPBOARD', width: 206, height: 900, quantityPer: 7, note: 'panel' });

    // PANEL headboard – 3/4
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1060, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 855, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 600, height: 10, quantityPer: 2, note: 'offcut' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: 'CHIPBOARD', width: 219, height: 900, quantityPer: 5, note: 'panel' });

    // PANEL headboard – Single
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 960, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 855, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 520, height: 23, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 600, height: 10, quantityPer: 2, note: 'offcut' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 6, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: 'CHIPBOARD', width: 199, height: 900, quantityPer: 5, note: 'panel' });

    // BELLA headboard – Queen
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 1560, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 790, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 750, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: 'MASONITE', width: 1600, height: 900, quantityPer: 1, note: 'back' });

    // BELLA headboard – Double
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 1410, height: 33, quantityPer: 4, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 730, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 660, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: 'MASONITE', width: 1450, height: 875, quantityPer: 1, note: 'back' });

    // BELLA headboard – 3/4
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 1160, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 590, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 545, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: 'MASONITE', width: 1200, height: 875, quantityPer: 1, note: 'back' });

    // BELLA headboard – Single
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1450, height: 33, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 1410, height: 33, quantityPer: 1, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 960, height: 33, quantityPer: 3, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 490, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 445, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 530, height: 23, quantityPer: 2, note: 'frame' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'triangle' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'PINE', width: 0, height: 0, quantityPer: 4, note: 'square' });
    rules.push({ department: 'WOOD', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: 'MASONITE', width: 1000, height: 875, quantityPer: 1, note: 'back' });

    // WINGBACK add-on (wood) per-wing counts; each headboard has two wings
    rules.push({ department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'CHIPBOARD', width: 1450, height: 50, quantityPer: 2, note: 'wing (12mm)' });
    rules.push({ department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 110, height: 110, quantityPer: 4, note: 'wing' });
    rules.push({ department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'PINE', width: 105, height: 50, quantityPer: 5, note: 'wing' });
    rules.push({ department: 'WOOD', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: 'POLYPROP', width: 1690, height: 40, quantityPer: 1, note: 'wing' });

    // ---------------- FOAM Department (SPONGE)
    // BELLA foam per size
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: '40mm White', width: 1590, height: 875, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.QUEEN, material: '20mm White', width: 1640, height: 910, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: '40mm White', width: 1440, height: 875, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.DOUBLE, material: '20mm White', width: 1470, height: 910, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: '40mm White', width: 1190, height: 875, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.THREE_QUARTER, material: '20mm White', width: 1220, height: 910, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: '40mm White', width: 990, height: 875, quantityPer: 1, note: 'sponge' });
    rules.push({ department: 'FOAM', productKind: ProductKind.BELLA, sizeKey: SizeKey.SINGLE, material: '20mm White', width: 1020, height: 910, quantityPer: 1, note: 'sponge' });

    // PANEL foam per size
    rules.push({ department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.QUEEN, material: '40mm White', width: 215, height: 920, quantityPer: 8, note: 'sponge panel' });
    rules.push({ department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.DOUBLE, material: '40mm White', width: 222, height: 920, quantityPer: 7, note: 'sponge panel' });
    rules.push({ department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.THREE_QUARTER, material: '40mm White', width: 255, height: 920, quantityPer: 5, note: 'sponge panel' });
    rules.push({ department: 'FOAM', productKind: ProductKind.PANEL, sizeKey: SizeKey.SINGLE, material: '40mm White', width: 215, height: 920, quantityPer: 5, note: 'sponge panel' });

    // WINGBACK foam (per wing)
    rules.push({ department: 'FOAM', productKind: ProductKind.WINGBACK, sizeKey: SizeKey.ANY, material: '10mm White', width: 1515, height: 280, quantityPer: 1, note: 'wing' });

    await this.$transaction(rules.map((data) => this.cuttingRule.create({ data })));
  }
}
