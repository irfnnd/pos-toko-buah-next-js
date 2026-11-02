import assert from "node:assert";
import { test, describe } from "node:test";
import {
  calculateReceiptHeight,
  generateReceiptPdf,
  ReceiptSaleData,
} from "../src/lib/utils/receipt-pdf";

describe("Mini Printer Receipt PDF Generation Tests", () => {
  const sampleSale: ReceiptSaleData = {
    invoiceNo: "INV-20261102-0001",
    saleDate: new Date("2026-11-02T09:30:00Z"),
    paymentMethod: "TUNAI",
    totalAmount: 75000,
    paidAmount: 100000,
    changeAmount: 25000,
    note: "Pelanggan setia",
    cashier: { name: "Budi Santoso" },
    items: [
      {
        id: "item-1",
        fruit: { name: "Apel Fuji Super Manis", unit: "Kg" },
        quantity: 2,
        sellPrice: 25000,
        subtotal: 50000,
        stockBatch: { batchNumber: "APL-001" },
      },
      {
        id: "item-2",
        fruit: { name: "Jeruk Medan Segar", unit: "Kg" },
        quantity: 1,
        sellPrice: 25000,
        subtotal: 25000,
        stockBatch: { batchNumber: "JRK-002" },
      },
    ],
  };

  test("calculateReceiptHeight returns a positive dynamic height for 58mm mini printer", () => {
    const height58 = calculateReceiptHeight(sampleSale, { paperWidth: 58 });
    assert.ok(height58 > 60, `Height for 58mm (${height58}mm) should be greater than 60mm`);
    assert.ok(height58 < 200, `Height for 58mm (${height58}mm) should not be unreasonably large`);
  });

  test("calculateReceiptHeight increases dynamically when more items are added", () => {
    const heightBase = calculateReceiptHeight(sampleSale, { paperWidth: 58 });

    const saleWithMoreItems: ReceiptSaleData = {
      ...sampleSale,
      items: [
        ...(sampleSale.items || []),
        {
          id: "item-3",
          fruit: { name: "Pisang Cavendish Premium", unit: "Sisir" },
          quantity: 2,
          sellPrice: 30000,
          subtotal: 60000,
          stockBatch: { batchNumber: "PSG-003" },
        },
      ],
    };

    const heightMore = calculateReceiptHeight(saleWithMoreItems, { paperWidth: 58 });
    assert.ok(
      heightMore > heightBase,
      `Receipt with more items (${heightMore}mm) must be taller than base receipt (${heightBase}mm)`
    );
  });

  test("generateReceiptPdf creates a single-page document with exact mini printer dimensions", () => {
    const doc58 = generateReceiptPdf(sampleSale, { paperWidth: 58 });
    assert.strictEqual(doc58.getNumberOfPages(), 1, "Receipt must fit on a single continuous page");

    const pageSize58 = doc58.internal.pageSize;
    assert.strictEqual(Math.round(pageSize58.getWidth()), 58, "Width must be 58mm for mini printer");

    const doc80 = generateReceiptPdf(sampleSale, { paperWidth: 80 });
    const pageSize80 = doc80.internal.pageSize;
    assert.strictEqual(Math.round(pageSize80.getWidth()), 80, "Width must be 80mm for standard printer");
  });

  test("generateReceiptPdf handles missing optional fields gracefully", () => {
    const minimalSale: ReceiptSaleData = {
      invoiceNo: "INV-MINIMAL",
      paymentMethod: "QRIS",
      totalAmount: 15000,
      paidAmount: 15000,
      changeAmount: 0,
      items: [],
    };

    const doc = generateReceiptPdf(minimalSale, { paperWidth: 58 });
    assert.strictEqual(doc.getNumberOfPages(), 1);
  });
});

