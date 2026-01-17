import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoiceScanningService } from './invoice-scanning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Export the interface for external use
export interface ParsedInvoice {
  supplierName?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
  }>;
  totalAmount?: number;
  date?: string;
  invoiceNumber?: string;
}

@Controller('invoice-scanning')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceScanningController {
  constructor(private readonly invoiceScanningService: InvoiceScanningService) {}

  @Post('upload')
  @Roles('ADMIN', 'DEPARTMENT')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(@UploadedFile() file: Express.Multer.File): Promise<{ success: boolean; data: ParsedInvoice }> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const parsedInvoice = await this.invoiceScanningService.processInvoiceImage(file.buffer);
    return {
      success: true,
      data: parsedInvoice,
    };
  }

  @Post('create-purchase')
  @Roles('ADMIN', 'DEPARTMENT')
  async createPurchaseFromInvoice(@Body() body: {
    parsedInvoice: any;
    supplierId: number;
  }) {
    return this.invoiceScanningService.createPurchaseFromInvoice(
      body.parsedInvoice,
      body.supplierId
    );
  }

  @Get('suppliers')
  @Roles('ADMIN', 'DEPARTMENT')
  async getSuppliersForMatching() {
    return this.invoiceScanningService.getSuppliersForMatching();
  }

  @Post('match-supplier')
  @Roles('ADMIN', 'DEPARTMENT')
  async matchSupplier(@Body() body: { text: string }) {
    return this.invoiceScanningService.matchSupplierFromText(body.text);
  }
}
