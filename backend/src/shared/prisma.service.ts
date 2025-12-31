import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '../../prisma/prisma.config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Expose model delegates for convenience (e.g. `prisma.user`)
  get user() {
    return this.client.user;
  }
}
