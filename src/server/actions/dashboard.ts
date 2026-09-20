"use server";

import { db } from "@/lib/db";
import { ExpiryStatus, SaleStatus } from "@prisma/client";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { id } from "date-fns/locale";

export async function getDashboardSummaryAction() {
  const now = new Date();
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);
  const start7DaysAgo = startOfDay(subDays(now, 6));

  const [
    todaySales,
    allBatches,
    sales7Days,
    topSaleItems,
    lastTransactions,
  ] = await Promise.all([
    // Today's Sales
    db.sale.findMany({
      where: {
        saleDate: { gte: startToday, lte: endToday },
        status: SaleStatus.COMPLETED,
      },
      include: {
        items: true,
      },
    }),

    // Stock Batches for Expiry & Inventory stats
    db.stockBatch.findMany({
      select: {
        currentQuantity: true,
        status: true,
      },
    }),

    // 7-day Sales Trend
    db.sale.findMany({
      where: {
        saleDate: { gte: start7DaysAgo, lte: endToday },
        status: SaleStatus.COMPLETED,
      },
      include: {
        items: true,
      },
      orderBy: { saleDate: "asc" },
    }),

    // Top Selling Items
    db.saleItem.groupBy({
      by: ["fruitId"],
      _sum: {
        quantity: true,
        subtotal: true,
        profit: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),

    // Last 5 Transactions
    db.sale.findMany({
      take: 5,
      orderBy: { saleDate: "desc" },
      include: {
        cashier: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  // Today Stats
  let penjualanHariIni = 0;
  let labaHariIni = 0;
  const transaksiHariIni = todaySales.length;

  for (const sale of todaySales) {
    penjualanHariIni += sale.totalAmount;
    for (const item of sale.items) {
      labaHariIni += item.profit || 0;
    }
  }

  // Stock Stats
  let totalStok = 0;
  let mendekatiMasaSimpanCount = 0;
  let melewatiMasaSimpanCount = 0;

  for (const batch of allBatches) {
    totalStok += batch.currentQuantity;
    if (batch.status === ExpiryStatus.SEGERA_BATAS) {
      mendekatiMasaSimpanCount += 1;
    } else if (batch.status === ExpiryStatus.MELEWATI_BATAS) {
      melewatiMasaSimpanCount += 1;
    }
  }

  // 7-Day Trend Map
  const trendMap = new Map<string, { date: string; sales: number; profit: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    const key = format(d, "dd MMM", { locale: id });
    trendMap.set(key, { date: key, sales: 0, profit: 0 });
  }

  for (const sale of sales7Days) {
    const key = format(new Date(sale.saleDate), "dd MMM", { locale: id });
    const existing = trendMap.get(key) || { date: key, sales: 0, profit: 0 };
    existing.sales += sale.totalAmount;
    for (const item of sale.items) {
      existing.profit += item.profit || 0;
    }
    trendMap.set(key, existing);
  }

  // Fetch Fruit Details for Top Products
  const fruitIds = topSaleItems.map((item) => item.fruitId);
  const fruits = await db.fruit.findMany({
    where: { id: { in: fruitIds } },
    select: { id: true, name: true, code: true, unit: true },
  });

  const topProducts = topSaleItems.map((item) => {
    const fruit = fruits.find((f) => f.id === item.fruitId);
    return {
      fruitId: item.fruitId,
      name: fruit?.name || "Buah",
      code: fruit?.code || "-",
      unit: fruit?.unit || "Kg",
      totalQty: Math.round((item._sum.quantity || 0) * 100) / 100,
      totalRevenue: item._sum.subtotal || 0,
      totalProfit: item._sum.profit || 0,
    };
  });

  return {
    metrics: {
      penjualanHariIni,
      transaksiHariIni,
      labaHariIni,
      totalStok: Math.round(totalStok * 100) / 100,
      mendekatiMasaSimpanCount,
      melewatiMasaSimpanCount,
    },
    salesTrend7Days: Array.from(trendMap.values()),
    topProducts,
    lastTransactions,
  };
}
