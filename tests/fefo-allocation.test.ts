import assert from "node:assert";
import { test, describe } from "node:test";
import { ExpiryStatus, Fruit, StockBatch } from "@prisma/client";
import {
  allocateBatchesFEFO,
  getAvailableStockFEFO,
  FruitWithBatches,
} from "../src/lib/utils/fefo-cart";

describe("FEFO Stock Allocation & Cart Utility Tests", () => {
  const dummyFruit: FruitWithBatches = {
    id: "fruit-1",
    code: "F001",
    name: "Apel Fuji Premium",
    unit: "Kg",
    defaultBuyPrice: 20000,
    sellPrice: 35000,
    currentStock: 35,
    minStock: 5,
    defaultShelfLifeDays: 14,
    status: "ACTIVE",
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    batches: [
      {
        id: "batch-b",
        batchNumber: "BATCH-B",
        fruitId: "fruit-1",
        supplierId: "sup-1",
        receiveDate: new Date("2026-09-05"),
        initialQuantity: 20,
        currentQuantity: 15,
        unit: "Kg",
        buyPrice: 22000,
        shelfLifeDays: 14,
        expiryDate: new Date("2026-09-19"), // Expires second
        status: ExpiryStatus.AMAN,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "batch-a",
        batchNumber: "BATCH-A",
        fruitId: "fruit-1",
        supplierId: "sup-1",
        receiveDate: new Date("2026-09-01"),
        initialQuantity: 10,
        currentQuantity: 10,
        unit: "Kg",
        buyPrice: 20000,
        shelfLifeDays: 14,
        expiryDate: new Date("2026-09-15"), // Expires first!
        status: ExpiryStatus.SEGERA_BATAS,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "batch-expired",
        batchNumber: "BATCH-EXPIRED",
        fruitId: "fruit-1",
        supplierId: "sup-1",
        receiveDate: new Date("2026-08-01"),
        initialQuantity: 10,
        currentQuantity: 10,
        unit: "Kg",
        buyPrice: 18000,
        shelfLifeDays: 14,
        expiryDate: new Date("2026-08-15"), // Expired!
        status: ExpiryStatus.MELEWATI_BATAS,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  test("getAvailableStockFEFO ignores expired batches and zero-stock batches", () => {
    const totalAvailable = getAvailableStockFEFO(dummyFruit);
    // BATCH-A (10) + BATCH-B (15) = 25. BATCH-EXPIRED (10) is excluded.
    assert.strictEqual(totalAvailable, 25);
  });

  test("allocateBatchesFEFO prioritizes earliest expiring non-expired batch (FEFO)", () => {
    // Requesting 5 Kg. Should take all 5 Kg from BATCH-A (expires 15 Sept vs 19 Sept).
    const allocations = allocateBatchesFEFO(dummyFruit, 5);

    assert.strictEqual(allocations.length, 1);
    assert.strictEqual(allocations[0].stockBatchId, "batch-a");
    assert.strictEqual(allocations[0].quantity, 5);
    assert.strictEqual(allocations[0].buyPrice, 20000);
    assert.strictEqual(allocations[0].sellPrice, 35000);
    assert.strictEqual(allocations[0].subtotal, 175000); // 5 * 35,000
    assert.strictEqual(allocations[0].costTotal, 100000); // 5 * 20,000
    assert.strictEqual(allocations[0].profit, 75000);    // 175,000 - 100,000
  });

  test("allocateBatchesFEFO splits across multiple batches when requested quantity exceeds first batch", () => {
    // Requesting 15 Kg. BATCH-A has 10 Kg, BATCH-B has 15 Kg.
    // Should take 10 Kg from BATCH-A, and 5 Kg from BATCH-B.
    const allocations = allocateBatchesFEFO(dummyFruit, 15);

    assert.strictEqual(allocations.length, 2);

    // First allocation: BATCH-A (10 Kg)
    assert.strictEqual(allocations[0].stockBatchId, "batch-a");
    assert.strictEqual(allocations[0].quantity, 10);
    assert.strictEqual(allocations[0].subtotal, 350000); // 10 * 35,000
    assert.strictEqual(allocations[0].costTotal, 200000); // 10 * 20,000
    assert.strictEqual(allocations[0].profit, 150000);

    // Second allocation: BATCH-B (5 Kg)
    assert.strictEqual(allocations[1].stockBatchId, "batch-b");
    assert.strictEqual(allocations[1].quantity, 5);
    assert.strictEqual(allocations[1].subtotal, 175000); // 5 * 35,000
    assert.strictEqual(allocations[1].costTotal, 110000); // 5 * 22,000
    assert.strictEqual(allocations[1].profit, 65000);
  });

  test("allocateBatchesFEFO throws error when requested quantity exceeds total available stock", () => {
    // Requesting 30 Kg when only 25 Kg is available in non-expired batches
    assert.throws(
      () => allocateBatchesFEFO(dummyFruit, 30),
      /Stok tidak mencukupi untuk Apel Fuji Premium/
    );
  });
});
