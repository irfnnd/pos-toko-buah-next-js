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
  };
}

export async function getProfitLossReport(filters: LaporanFilterOptions = {}) {
  const { datePreset = "thisMonth", startDate, endDate } = filters;

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

  const saleWhereClause: any = { status: SaleStatus.COMPLETED };
  const expenseWhereClause: any = {};

  if (fromDate || toDate) {
    saleWhereClause.saleDate = {};
    expenseWhereClause.date = {};
    if (fromDate) {
      saleWhereClause.saleDate.gte = fromDate;
      expenseWhereClause.date.gte = fromDate;
    }
    if (toDate) {
      saleWhereClause.saleDate.lte = toDate;
      expenseWhereClause.date.lte = toDate;
    }
  }

  const [sales, expenses] = await Promise.all([
    db.sale.findMany({
      where: saleWhereClause,
      include: {
        items: true,
      },
    }),
    db.expense.findMany({
      where: expenseWhereClause,
      orderBy: { date: "desc" },
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

  // Expense Categories breakdown
  const categoryMap = new Map<string, number>();
  let totalExpenses = 0;

  for (const exp of expenses) {
    totalExpenses += exp.amount;
    const cat = exp.category || "Operasional";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);
  }

  const netProfit = grossProfit - totalExpenses;

  const expenseBreakdown = Array.from(categoryMap.entries()).map(([category, total]) => ({
    category,
    total,
  }));

  return {
    statement: {
      totalSales,
      totalCostOfGoods,
      grossProfit,
      totalExpenses,
      netProfit,
    },
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

