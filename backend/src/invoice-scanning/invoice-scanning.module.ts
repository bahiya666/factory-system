import { Module } from '@nestjs/common';
import { InvoiceScanningService } from './invoice-scanning.service';
import { InvoiceScanningController } from './invoice-scanning.controller';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [InvoiceScanningController],
  providers: [InvoiceScanningService, PrismaService],
  exports: [InvoiceScanningService],
})
export class InvoiceScanningModule {}
