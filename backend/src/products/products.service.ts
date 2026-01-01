import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // seed relational data using the provided defaults
  async onModuleInit() {
    const count = await this.prisma.product.count();
    if (count === 0) {
      const defaults = [
        {
          name: 'Bella Headboard',
          sizes: ['Queen', 'Double', '3/4', 'Single'],
          fabrics: {
            Velvet: [
              'Dark grey','Light grey','Black','Brown','Taupe','Gold','Cream','Biscuit','Emerald green','Olive green','Royal blue','Cyan','Baby pink','Cerise pink','Scarlet','Lilac','Orange','Burnt orange'
            ],
            BOUCLE: ['Black','Dark grey','Light grey'],
          },
        },
        {
          name: 'Bella Wingback Headboard',
          sizes: ['Queen', 'Double', '3/4', 'Single'],
          fabrics: {
            Velvet: [
              'Dark grey','Light grey','Black','Brown','Taupe','Gold','Cream','Biscuit','Emerald green','Olive green','Royal blue','Cyan','Baby pink','Cerise pink','Scarlet','Lilac','Orange','Burnt orange'
            ],
            BOUCLE: ['Black','Dark grey','Light grey'],
          },
        },
        {
          name: 'Panel Headboard',
          sizes: ['Queen', 'Double', '3/4', 'Single'],
          fabrics: {
            Velvet: [
              'Dark grey','Light grey','Black','Brown','Taupe','Gold','Cream','Biscuit','Emerald green','Olive green','Royal blue','Cyan','Baby pink','Cerise pink','Scarlet','Lilac','Orange','Burnt orange'
            ],
            BOUCLE: ['Black','Dark grey','Light grey'],
          },
        },
        {
          name: 'Panel Wingback Headboard',
          sizes: ['Queen', 'Double', '3/4', 'Single'],
          fabrics: {
            Velvet: [
              'Dark grey','Light grey','Black','Brown','Taupe','Gold','Cream','Biscuit','Emerald green','Olive green','Royal blue','Cyan','Baby pink','Cerise pink','Scarlet','Lilac','Orange','Burnt orange'
            ],
            BOUCLE: ['Black','Dark grey','Light grey'],
          },
        },
        {
          name: 'zeus',
          sizes: ['King','Queen','Double','3/4','Single'],
          fabrics: {
            Linen: ['Black','Brown','Grey','Sand'],
          },
        },
        {
          name: 'zuka',
          sizes: ['King','Queen','Double','3/4','Single'],
          fabrics: {
            Leather: ['black','brown'],
          },
        },
      ];

      for (const p of defaults) {
        try {
          // ensure sizes exist
          const connectSizes = [] as Array<{ name: string }>;
          for (const s of p.sizes) {
            await this.prisma.size.upsert({ where: { name: s }, update: {}, create: { name: s } });
            connectSizes.push({ name: s });
          }

          // create product if missing
          let prod = await this.prisma.product.findUnique({ where: { name: p.name } });
          if (!prod) {
            prod = await this.prisma.product.create({ data: { name: p.name, sizes: { connect: connectSizes } } });
          }

          // ensure fabrics, colors and link them to product
          for (const [fname, colors] of Object.entries(p.fabrics)) {
            let fabric = await this.prisma.fabric.findUnique({ where: { name: fname } });
            if (!fabric) {
              fabric = await this.prisma.fabric.create({ data: { name: fname } });
            }

            // ensure colors for this fabric
            for (const colorName of colors as string[]) {
              const existingColor = await this.prisma.color.findFirst({ where: { name: colorName, fabricId: fabric.id } });
              if (!existingColor) {
                await this.prisma.color.create({ data: { name: colorName, fabricId: fabric.id } });
              }
            }

            // link fabric to product if not already linked
            const link = await this.prisma.productFabric.findFirst({ where: { productId: prod.id, fabricId: fabric.id } });
            if (!link) {
              await this.prisma.productFabric.create({ data: { productId: prod.id, fabricId: fabric.id } });
            }
          }
        } catch (e) {
          // ignore duplicate or constraint errors during seed
          console.warn('Seed product failed', p.name, e?.message || e);
        }
      }
    }
  }

  // return products with sizes and fabric->colors populated
  findAll() {
    return this.prisma.product.findMany({
      include: {
        sizes: true,
        fabrics: { include: { fabric: { include: { colors: true } } } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        fabrics: { include: { fabric: { include: { colors: true } } } },
      },
    });
  }

  // data.fabrics may be an object mapping fabricName -> colors[] OR an array of { name, colors }
  private async ensureFabricAndColors(fabricName: string, colors: string[]) {
    let fabric = await this.prisma.fabric.findUnique({ where: { name: fabricName } });
    if (!fabric) fabric = await this.prisma.fabric.create({ data: { name: fabricName } });
    for (const colorName of colors) {
      const exists = await this.prisma.color.findFirst({ where: { name: colorName, fabricId: fabric.id } });
      if (!exists) await this.prisma.color.create({ data: { name: colorName, fabricId: fabric.id } });
    }
    return fabric;
  }

  async create(data: { name: string; sizes?: string[]; fabrics?: any }) {
    // ensure sizes exist
    const connectSizes = [] as Array<{ name: string }>;
    if (data.sizes) {
      for (const s of data.sizes) {
        await this.prisma.size.upsert({ where: { name: s }, update: {}, create: { name: s } });
        connectSizes.push({ name: s });
      }
    }

    const prod = await this.prisma.product.create({ data: { name: data.name, sizes: { connect: connectSizes } } });

    // handle fabrics input formats
    const fabricsInput = data.fabrics ?? {};
    if (Array.isArray(fabricsInput)) {
      for (const f of fabricsInput) {
        const fabric = await this.ensureFabricAndColors(f.name, f.colors || []);
        await this.prisma.productFabric.create({ data: { productId: prod.id, fabricId: fabric.id } });
      }
    } else {
      for (const [fname, colors] of Object.entries(fabricsInput)) {
        const fabric = await this.ensureFabricAndColors(fname, colors as string[]);
        await this.prisma.productFabric.create({ data: { productId: prod.id, fabricId: fabric.id } });
      }
    }

    return this.findOne(prod.id);
  }

  async update(id: number, data: Partial<{ name: string; sizes: string[]; fabrics: any }>) {
    // update name
    if (data.name) {
      await this.prisma.product.update({ where: { id }, data: { name: data.name } });
    }

    // update sizes (replace set)
    if (data.sizes) {
      const connectSizes = [] as Array<{ name: string }>;
      for (const s of data.sizes) {
        await this.prisma.size.upsert({ where: { name: s }, update: {}, create: { name: s } });
        connectSizes.push({ name: s });
      }
      await this.prisma.product.update({ where: { id }, data: { sizes: { set: connectSizes } } });
    }

    // update fabrics: remove existing links and recreate
    if (data.fabrics) {
      await this.prisma.productFabric.deleteMany({ where: { productId: id } });
      const fabricsInput = data.fabrics;
      if (Array.isArray(fabricsInput)) {
        for (const f of fabricsInput) {
          const fabric = await this.ensureFabricAndColors(f.name, f.colors || []);
          await this.prisma.productFabric.create({ data: { productId: id, fabricId: fabric.id } });
        }
      } else {
        for (const [fname, colors] of Object.entries(fabricsInput)) {
          const fabric = await this.ensureFabricAndColors(fname, colors as string[]);
          await this.prisma.productFabric.create({ data: { productId: id, fabricId: fabric.id } });
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    // remove links first, then product
    await this.prisma.productFabric.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }
}
