import { ExpiryStatus, Fruit, StockBatch } from "@prisma/client";

export type FruitWithBatches = Fruit & {
  batches: StockBatch[];
};

export interface BatchAllocation {
  stockBatchId: string;
  batchNumber: string;
  expiryDate: Date;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  subtotal: number;
  costTotal: number;
  profit: number;
}

export interface CartItem {
  fruitId: string;
  fruitCode: string;
  fruitName: string;
  unit: string;
  sellPrice: number;
  requestedQuantity: number;
  allocations: BatchAllocation[];
  totalSubtotal: number;
  totalCost: number;
  totalProfit: number;
}

/**
 * Allocates requested quantity across active batches using FEFO (First Expired, First Out)
 */
export function allocateBatchesFEFO(
  fruit: FruitWithBatches,
  requestedQuantity: number
): BatchAllocation[] {
  // Filter valid batches (must have remaining quantity and not past expiry)
  const validBatches = fruit.batches
    .filter((b) => b.currentQuantity > 0 && b.status !== ExpiryStatus.MELEWATI_BATAS)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  let remainingToAllocate = Math.round(requestedQuantity * 1000) / 1000;
  const allocations: BatchAllocation[] = [];

  for (const batch of validBatches) {
    if (remainingToAllocate <= 0) break;

    const qtyFromBatch = Math.min(batch.currentQuantity, remainingToAllocate);
    const subtotal = qtyFromBatch * fruit.sellPrice;
    const costTotal = qtyFromBatch * batch.buyPrice;
    const profit = subtotal - costTotal;

    allocations.push({
      stockBatchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      buyPrice: batch.buyPrice,
      sellPrice: fruit.sellPrice,
      quantity: Math.round(qtyFromBatch * 1000) / 1000,
      subtotal,
      costTotal,
      profit,
    });

    remainingToAllocate = Math.round((remainingToAllocate - qtyFromBatch) * 1000) / 1000;
  }

  if (remainingToAllocate > 0.001) {
    throw new Error(
      `Stok tidak mencukupi untuk ${fruit.name}. Sisa yang dibutuhkan: ${remainingToAllocate} ${fruit.unit}`
    );
  }

  return allocations;
}

/**
 * Calculates total available stock for a fruit from active non-expired batches
 */
export function getAvailableStockFEFO(fruit: FruitWithBatches): number {
  return fruit.batches
    .filter((b) => b.currentQuantity > 0 && b.status !== ExpiryStatus.MELEWATI_BATAS)
    .reduce((sum, b) => sum + b.currentQuantity, 0);
}
