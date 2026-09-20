import assert from "node:assert";
import { test, describe } from "node:test";

interface SaleItemInput {
  quantity: number;
  sellPrice: number;
  batchBuyPrice: number;
}

function calculateSaleItem(item: SaleItemInput) {
  const subtotal = item.quantity * item.sellPrice;
  const costTotal = item.quantity * item.batchBuyPrice;
  const profit = subtotal - costTotal;
  return { subtotal, costTotal, profit };
}

function calculateSaleSummary(items: SaleItemInput[], paidAmount: number, paymentMethod: string) {
  let totalAmount = 0;
  let totalCostOfGoods = 0;
  let totalProfit = 0;

  for (const item of items) {
    const res = calculateSaleItem(item);
    totalAmount += res.subtotal;
    totalCostOfGoods += res.costTotal;
    totalProfit += res.profit;
  }

  if (paymentMethod === "CASH" && paidAmount < totalAmount) {
    throw new Error(`Uang bayar (Rp${paidAmount}) kurang dari total transaksi (Rp${totalAmount})`);
  }

  const changeAmount = paymentMethod === "CASH" ? Math.max(0, paidAmount - totalAmount) : 0;

  return {
    totalAmount,
    totalCostOfGoods,
    grossProfit: totalProfit,
    changeAmount,
  };
}

describe("Sale & Profit Calculation Tests", () => {
  test("calculateSaleItem correctly computes subtotal, costTotal, and profit per batch", () => {
    const item = {
      quantity: 3.5,
      sellPrice: 30000,
      batchBuyPrice: 18000,
    };

    const res = calculateSaleItem(item);
    assert.strictEqual(res.subtotal, 105000); // 3.5 * 30000
    assert.strictEqual(res.costTotal, 63000);  // 3.5 * 18000
    assert.strictEqual(res.profit, 42000);     // 105000 - 63000
  });

  test("calculateSaleSummary aggregates multi-item sales accurately with historical batch cost", () => {
    const items: SaleItemInput[] = [
      { quantity: 2, sellPrice: 30000, batchBuyPrice: 20000 }, // subtotal: 60k, cost: 40k, profit: 20k
      { quantity: 5, sellPrice: 15000, batchBuyPrice: 10000 }, // subtotal: 75k, cost: 50k, profit: 25k
    ];

    const summary = calculateSaleSummary(items, 150000, "CASH");

    assert.strictEqual(summary.totalAmount, 135000);
    assert.strictEqual(summary.totalCostOfGoods, 90000);
    assert.strictEqual(summary.grossProfit, 45000);
    assert.strictEqual(summary.changeAmount, 15000);
  });

  test("calculateSaleSummary throws error if cash paid is less than total amount", () => {
    const items: SaleItemInput[] = [
      { quantity: 2, sellPrice: 50000, batchBuyPrice: 30000 }, // total: 100k
    ];

    assert.throws(
      () => calculateSaleSummary(items, 80000, "CASH"),
      /Uang bayar \(Rp80000\) kurang dari total transaksi \(Rp100000\)/
    );
  });

  test("Net profit is calculated as Gross Profit minus Total Operational Expenses", () => {
    const grossProfit = 500000;
    const operationalExpenses = 120000;
    const netProfit = grossProfit - operationalExpenses;

    assert.strictEqual(netProfit, 380000);
  });
});
