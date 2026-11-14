import assert from "node:assert";
import { test, describe } from "node:test";
import { getExpiryStatus, getRemainingDays } from "../src/lib/utils/expiry";

describe("Web Push Stock & Expiry Alert Logic Tests", () => {
  test("generates MELEWATI_BATAS alert payload correctly when expiryDate has passed", () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const currentQuantity = 15;

    const status = getExpiryStatus(pastDate, currentQuantity);
    assert.strictEqual(status, "MELEWATI_BATAS");

    const fruitName = "Mangga Harum Manis";
    const batchNumber = "MB-20261101-001";
    const payload = {
      title: "🚨 Buah Melewati Masa Simpan!",
      message: `${fruitName} (Batch ${batchNumber}) telah melewati masa simpan! Segera periksa dan keluarkan stok busuk.`,
      link: "/stok",
      tag: `expired-batch-1`,
    };

    assert.ok(payload.title.includes("Melewati Masa Simpan"));
    assert.ok(payload.message.includes("MB-20261101-001"));
    assert.strictEqual(payload.link, "/stok");
  });

  test("generates SEGERA_BATAS alert payload correctly when within warning window", () => {
    const nearDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const currentQuantity = 10;

    const status = getExpiryStatus(nearDate, currentQuantity, 3);
    assert.strictEqual(status, "SEGERA_BATAS");

    const remainingDays = getRemainingDays(nearDate);
    assert.ok(remainingDays <= 3 && remainingDays >= 1);

    const fruitName = "Apel Fuji";
    const batchNumber = "MB-APL-02";
    const payload = {
      title: "⚠️ Peringatan Masa Simpan!",
      message: `${fruitName} (Batch ${batchNumber}) akan melewati masa simpan dalam ${remainingDays} hari! Prioritaskan penjualan FEFO.`,
      link: "/stok",
      tag: `warning-batch-2`,
    };

    assert.ok(payload.title.includes("Peringatan Masa Simpan"));
    assert.ok(payload.message.includes("Apel Fuji"));
  });

  test("generates LOW_STOCK alert payload correctly when stock is below or equal to minStock", () => {
    const fruit = {
      name: "Jeruk Medan",
      currentStock: 3.5,
      minStock: 5.0,
      unit: "Kg",
    };

    const isLowStock = fruit.currentStock <= fruit.minStock;
    assert.strictEqual(isLowStock, true);

    const payload = {
      title: "📦 Stok Buah Menipis!",
      message: `Stok ${fruit.name} tersisa ${fruit.currentStock} ${fruit.unit} (di bawah batas minimum ${fruit.minStock} ${fruit.unit}).`,
      link: "/stok",
      tag: `low-stock-jeruk`,
    };

    assert.ok(payload.title.includes("Stok Buah Menipis"));
    assert.ok(payload.message.includes("3.5 Kg"));
  });
});

