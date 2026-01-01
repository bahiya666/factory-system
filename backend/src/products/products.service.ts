import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.product.count();
    if (count === 0) {
      // Seed initial products
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
          // create with prisma
          // @ts-ignore
          await this.prisma.product.create({ data: { ...p } });
        } catch (e) {
          // ignore duplicates
        }
      }
    }
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: { name: string; sizes: string[]; fabrics: any }) {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: Partial<{ name: string; sizes: string[]; fabrics: any }>) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
