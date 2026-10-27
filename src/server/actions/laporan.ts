"use server";

import { db } from "@/lib/db";
import { PaymentMethod, SaleStatus } from "@prisma/client";
import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { id } from "date-fns/locale";

export interface LaporanFilterOptions {
  datePreset?: string; // 'today' | '7days' | 'thisMonth' | 'custom' | 'all'
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  paymentMethod?: string;
}
function getReportDateRange(filters: LaporanFilterOptions) {
  const {
    datePreset = "thisMonth",
    startDate,
    endDate,
  } = filters;

  const now = new Date();
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (datePreset === "today") {
    fromDate = startOfDay(now);
    toDate = endOfDay(now);
  } else if (datePreset === "7days") {
    fromDate = startOfDay(subDays(now, 6));
    toDate = endOfDay(now);
  } else if (datePreset === "thisMonth") {
    fromDate = startOfMonth(now);
    toDate = endOfMonth(now);
  } else if (datePreset === "custom" && (startDate || endDate)) {
    if (startDate) {
      fromDate = startOfDay(new Date(startDate));
    }
    if (endDate) {
      toDate = endOfDay(new Date(endDate));
    }
  }

  const where: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (fromDate) where.gte = fromDate;
  if (toDate) where.lte = toDate;

  return {
    fromDate,
    toDate,
    dateFilter: fromDate || toDate ? where : undefined,
  };
}
export async function getSalesReport(filters: LaporanFilterOptions = {}) {
  const {
    datePreset = "thisMonth",
    startDate,
    endDate,
    cashierId = "all",
    paymentMethod = "all",
  } = filters;

  const whereClause: any = {
    status: SaleStatus.COMPLETED,
  };

  // Date Filter logic
  const now = new Date();
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (datePreset === "today") {
    fromDate = startOfDay(now);
    toDate = endOfDay(now);
  } else if (datePreset === "7days") {
    fromDate = startOfDay(subDays(now, 6));
    toDate = endOfDay(now);
  } else if (datePreset === "thisMonth") {
    fromDate = startOfMonth(now);
    toDate = endOfMonth(now);
  } else if (datePreset === "custom" && (startDate || endDate)) {
    if (startDate) fromDate = startOfDay(new Date(startDate));
    if (endDate) toDate = endOfDay(new Date(endDate));
  }

  if (fromDate || toDate) {
    whereClause.saleDate = {};
    if (fromDate) whereClause.saleDate.gte = fromDate;
    if (toDate) whereClause.saleDate.lte = toDate;
  }

  if (cashierId && cashierId !== "all") {
    whereClause.cashierId = cashierId;
  }

  if (paymentMethod && paymentMethod !== "all") {
    whereClause.paymentMethod = paymentMethod as PaymentMethod;
  }
  const { dateFilter } = getReportDateRange(filters);

  const stockMovements = await db.stockMovement.findMany({
    where: {
      type: {
        in: [
          "OUT_SALE",
          "OUT_EXPIRED",
          "OUT_DAMAGED",
          "OUT_ADJUSTMENT",
        ],
      },
      ...(dateFilter
        ? { createdAt: dateFilter }
        : {}),
    },
    include: {
      fruit: {
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
          defaultBuyPrice: true,
        },
      },
      stockBatch: {
        select: {
          id: true,
          batchNumber: true,
          buyPrice: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  // Fetch Sales & Items
  const sales = await db.sale.findMany({
    where: whereClause,
    include: {
      cashier: {
        select: { id: true, name: true, username: true },
      },
      items: {
        include: {
          fruit: { select: { id: true, code: true, name: true, unit: true } },
          stockBatch: { select: { id: true, batchNumber: true } },
        },
      },
    },
    orderBy: { saleDate: "desc" },
  });

  // Calculate Metrics
  let totalSales = 0;
  let totalCostOfGoods = 0;
  let totalProfit = 0;
  const completedCount = sales.length;

  const dailyTrendMap = new Map<string, { date: string; sales: number; profit: number; cost: number }>();
  const paymentMap = new Map<string, { method: string; total: number; count: number }>();
  const fruitSalesMap = new Map<string, { fruitName: string; fruitCode: string; unit: string; totalQty: number; totalRevenue: number; totalProfit: number }>();

  for (const sale of sales) {
    totalSales += sale.totalAmount;

    // Payment distribution
    const payKey = sale.paymentMethod;
    const currentPay = paymentMap.get(payKey) || { method: payKey, total: 0, count: 0 };
    currentPay.total += sale.totalAmount;
    currentPay.count += 1;
    paymentMap.set(payKey, currentPay);

    // Daily trend
    const dateKey = format(new Date(sale.saleDate), "dd MMM", { locale: id });
    const currentDaily = dailyTrendMap.get(dateKey) || { date: dateKey, sales: 0, profit: 0, cost: 0 };
    currentDaily.sales += sale.totalAmount;

    for (const item of sale.items) {
      totalCostOfGoods += item.costTotal || 0;
      totalProfit += item.profit || 0;
      currentDaily.profit += item.profit || 0;
      currentDaily.cost += item.costTotal || 0;

      // Top fruit products
      const fruitKey = item.fruitId;
      const currentFruit = fruitSalesMap.get(fruitKey) || {
        fruitName: item.fruit.name,
        fruitCode: item.fruit.code,
        unit: item.fruit.unit,
        totalQty: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };
      currentFruit.totalQty += item.quantity;
      currentFruit.totalRevenue += item.subtotal;
      currentFruit.totalProfit += item.profit;
      fruitSalesMap.set(fruitKey, currentFruit);
    }

    dailyTrendMap.set(dateKey, currentDaily);
  }

  const grossProfit = totalSales - totalCostOfGoods;
  const avgBasketSize = completedCount > 0 ? totalSales / completedCount : 0;

  // Convert maps to arrays
  const dailySalesTrend = Array.from(dailyTrendMap.values()).reverse();
  const paymentDistribution = Array.from(paymentMap.values());
  const topFruits = Array.from(fruitSalesMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);
  const stockOutSummary = {
    totalQuantity: 0,
    saleQuantity: 0,
    expiredQuantity: 0,
    damagedQuantity: 0,
    adjustmentQuantity: 0,
    expiredLoss: 0,
    damagedLoss: 0,
  };

  for (const movement of stockMovements) {
    const quantity = Math.abs(movement.quantity);

    stockOutSummary.totalQuantity += quantity;

    if (movement.type === "OUT_SALE") {
      stockOutSummary.saleQuantity += quantity;
    }

    if (movement.type === "OUT_EXPIRED") {
      stockOutSummary.expiredQuantity += quantity;

      const buyPrice =
        movement.stockBatch?.buyPrice ??
        movement.fruit.defaultBuyPrice;

      stockOutSummary.expiredLoss += quantity * buyPrice;
    }

    if (movement.type === "OUT_DAMAGED") {
      stockOutSummary.damagedQuantity += quantity;

      const buyPrice =
        movement.stockBatch?.buyPrice ??
        movement.fruit.defaultBuyPrice;

      stockOutSummary.damagedLoss += quantity * buyPrice;
    }

    if (movement.type === "OUT_ADJUSTMENT") {
      stockOutSummary.adjustmentQuantity += quantity;
    }
  }
  return {
    summary: {
      totalSales,
      totalCostOfGoods,
      grossProfit,
      completedCount,
      avgBasketSize,
    },
    dailySalesTrend,
    paymentDistribution,
    topFruits,
    sales,
    stockOutSummary,
    stockMovements,
  };
}


export async function getProfitLossReport(
  filters: LaporanFilterOptions = {}
) {
  const { dateFilter } = getReportDateRange(filters);

  const saleWhereClause: any = {
    status: SaleStatus.COMPLETED,
  };

  if (dateFilter) {
    saleWhereClause.saleDate = dateFilter;
  }

  const expenseWhereClause: any = {};

  if (dateFilter) {
    expenseWhereClause.date = dateFilter;
  }

  const stockMovementWhereClause: any = {
    type: {
      in: ["OUT_EXPIRED", "OUT_DAMAGED"],
    },
  };

  if (dateFilter) {
    stockMovementWhereClause.createdAt = dateFilter;
  }

  const [sales, expenses, stockMovements] = await Promise.all([
    db.sale.findMany({
      where: saleWhereClause,
      include: {
        items: true,
      },
    }),

    db.expense.findMany({
      where: expenseWhereClause,
      orderBy: {
        date: "desc",
      },
    }),

    db.stockMovement.findMany({
      where: stockMovementWhereClause,
      include: {
        fruit: {
          select: {
            id: true,
            name: true,
            code: true,
            unit: true,
            defaultBuyPrice: true,
          },
        },
        stockBatch: {
          select: {
            id: true,
            batchNumber: true,
            buyPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  let totalSales = 0;
  let totalCostOfGoods = 0;

  for (const sale of sales) {
    totalSales += sale.totalAmount;

    for (const item of sale.items) {
      totalCostOfGoods += item.costTotal || 0;
    }
  }

  const grossProfit = totalSales - totalCostOfGoods;

  // Total pengeluaran operasional
  const categoryMap = new Map<string, number>();
  let totalExpenses = 0;

  for (const exp of expenses) {
    totalExpenses += exp.amount;

    const category = exp.category || "Operasional";

    categoryMap.set(
      category,
      (categoryMap.get(category) || 0) + exp.amount
    );
  }

  // Kerugian stok busuk dan rusak
  let totalStockLoss = 0;
  let expiredLoss = 0;
  let damagedLoss = 0;
  let expiredQuantity = 0;
  let damagedQuantity = 0;

  const stockLossDetails = stockMovements.map((movement) => {
    const quantity = Math.abs(movement.quantity);

    // Gunakan harga modal batch; gunakan harga modal default
    // buah jika batch sudah tidak tersedia.
    const buyPrice =
      movement.stockBatch?.buyPrice ??
      movement.fruit.defaultBuyPrice;

    const loss = quantity * buyPrice;

    totalStockLoss += loss;

    if (movement.type === "OUT_EXPIRED") {
      expiredLoss += loss;
      expiredQuantity += quantity;
    } else if (movement.type === "OUT_DAMAGED") {
      damagedLoss += loss;
      damagedQuantity += quantity;
    }

    return {
      id: movement.id,
      date: movement.createdAt,
      fruitName: movement.fruit.name,
      fruitCode: movement.fruit.code,
      type: movement.type,
      quantity,
      unit: movement.unit,
      buyPrice,
      loss,
      batchNumber: movement.stockBatch?.batchNumber ?? "-",
      note: movement.note,
    };
  });

  // Kerugian stok dikurangi satu kali dari laba bersih.
  const netProfit =
    grossProfit - totalExpenses - totalStockLoss;

  const expenseBreakdown = Array.from(
    categoryMap.entries()
  ).map(([category, total]) => ({
    category,
    total,
  }));

  return {
    statement: {
      totalSales,
      totalCostOfGoods,
      grossProfit,
      totalExpenses,
      totalStockLoss,
      expiredLoss,
      damagedLoss,
      netProfit,
    },

    stockLossSummary: {
      expiredQuantity,
      damagedQuantity,
      expiredLoss,
      damagedLoss,
      totalStockLoss,
    },

    stockLossDetails,
    expenseBreakdown,
    expenses,
    salesCount: sales.length,
  };
}

export async function getCashiersAction() {
  const users = await db.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return users;
}

