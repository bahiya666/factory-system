import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import * as Tesseract from 'tesseract.js';
import { ParsedInvoice } from './invoice-scanning.controller';

@Injectable()
export class InvoiceScanningService {
  constructor(private prisma: PrismaService) {}

  // Real OCR processing with Tesseract.js
  async processInvoiceImage(imageBuffer: Buffer): Promise<ParsedInvoice> {
    try {
      console.log('Starting OCR processing...');
      
      // Convert buffer to base64 for Tesseract
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      // Perform OCR with Tesseract
      const { data: { text } } = await Tesseract.recognize(
        base64Image,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      console.log('OCR completed, extracted text:', text);
      
      return this.parseOCRText(text);
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new BadRequestException('Failed to process invoice image');
    }
  }

  // Create purchase from scanned invoice
  async createPurchaseFromInvoice(
    parsedInvoice: ParsedInvoice,
    supplierId: number
  ): Promise<any> {
    if (!parsedInvoice.items || parsedInvoice.items.length === 0) {
      throw new BadRequestException('No items found in invoice');
    }

    const results: any[] = [];

    for (const item of parsedInvoice.items) {
      try {
        // Find or create the product
        let product = await this.prisma.supplierProduct.findFirst({
          where: {
            name: {
              contains: item.name,
              mode: 'insensitive',
            },
            supplierId,
          },
        });

        if (!product) {
          // Create new product if not found
          product = await this.prisma.supplierProduct.create({
            data: {
              name: item.name,
              unitCost: item.unitPrice,
              supplierId,
            },
          });
        }

        // Create purchase
        const purchase = await this.prisma.purchase.create({
          data: {
            productId: product.id,
            supplierId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
            dateBought: parsedInvoice.date ? new Date(parsedInvoice.date) : new Date(),
          },
          include: {
            product: true,
            supplier: true,
          },
        });

        // Update inventory
        await this.updateInventory(product.id, item.quantity);

        results.push(purchase);
      } catch (error) {
        console.error(`Failed to create purchase for item ${item.name}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully created ${results.length} purchases`,
      purchases: results,
    };
  }

  // Get suppliers for matching
  async getSuppliersForMatching(): Promise<any[]> {
    return this.prisma.supplier.findMany({
      include: {
        products: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Match supplier from invoice text
  async matchSupplierFromText(text: string): Promise<any[]> {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        products: true,
      },
    });

    // Simple text matching - in production, use more sophisticated matching
    const matches = suppliers.filter(supplier => 
      text.toLowerCase().includes(supplier.name.toLowerCase()) ||
      supplier.name.toLowerCase().includes(text.toLowerCase())
    );

    return matches;
  }

  private parseOCRText(ocrText: string): ParsedInvoice {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line);
    
    const result: ParsedInvoice = {
      items: [],
    };

    console.log('Parsing OCR text lines:', lines);

    // Enhanced patterns for better extraction
    const patterns = {
      supplier: /(?:supplier|company|from|bill to)[:\s]*([A-Za-z0-9\s&.,'-]+)/i,
      date: /(?:date|invoice date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      invoice: /(?:invoice|inv|#)[:\s]*([A-Z0-9\-]+)/i,
      total: /(?:total|amount|due)[:\s]*\$?(\d+,?\d*\.?\d{2})/i,
      itemLine: /(.+?)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      simpleItem: /(.+?)\s+(\d+)\s+x\s+(\d+\.?\d*)/i
    };

    for (const line of lines) {
      // Extract supplier name
      if (!result.supplierName) {
        const supplierMatch = line.match(patterns.supplier);
        if (supplierMatch) {
          result.supplierName = supplierMatch[1].trim();
          continue;
        }
      }

      // Extract date
      if (!result.date) {
        const dateMatch = line.match(patterns.date);
        if (dateMatch) {
          result.date = dateMatch[1];
          continue;
        }
      }

      // Extract invoice number
      if (!result.invoiceNumber) {
        const invoiceMatch = line.match(patterns.invoice);
        if (invoiceMatch) {
          result.invoiceNumber = invoiceMatch[1];
          continue;
        }
      }

      // Extract total amount
      if (!result.totalAmount) {
        const totalMatch = line.match(patterns.total);
        if (totalMatch) {
          result.totalAmount = parseFloat(totalMatch[1].replace(',', ''));
          continue;
        }
      }

      // Extract items (try multiple patterns)
      if (!result.items) result.items = [];
      
      let itemMatch = line.match(patterns.itemLine);
      if (!itemMatch) {
        itemMatch = line.match(patterns.simpleItem);
      }

      if (itemMatch) {
        const itemName = itemMatch[1].trim();
        const quantity = parseInt(itemMatch[2]);
        const unitPrice = parseFloat(itemMatch[3]);
        const totalPrice = itemMatch[4] ? parseFloat(itemMatch[4]) : quantity * unitPrice;
        
        // Only add if it looks like a valid item
        if (itemName && quantity > 0 && unitPrice > 0) {
          result.items.push({
            name: itemName,
            quantity,
            unitPrice,
            totalPrice
          });
        }
      }
    }

    // Fallback: if no items found, try to extract from any line with numbers
    if (!result.items || result.items.length === 0) {
      for (const line of lines) {
        const numberPattern = /([A-Za-z\s]+?)(\d+)\s+(\d+\.?\d*)/;
        const match = line.match(numberPattern);
        if (match) {
          const itemName = match[1].trim();
          const quantity = parseInt(match[2]);
          const unitPrice = parseFloat(match[3]);
          
          if (itemName && quantity > 0 && unitPrice > 0) {
            result.items!.push({
              name: itemName,
              quantity,
              unitPrice,
              totalPrice: quantity * unitPrice
            });
          }
        }
      }
    }

    console.log('Parsed invoice result:', result);
    return result;
  }

  private async updateInventory(productId: number, quantity: number): Promise<void> {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (existingInventory) {
      await this.prisma.inventory.update({
        where: { productId },
        data: {
          quantity: existingInventory.quantity + quantity,
        },
      });
    } else {
      await this.prisma.inventory.create({
        data: {
          productId,
          quantity,
        },
      });
    }
  }
}
