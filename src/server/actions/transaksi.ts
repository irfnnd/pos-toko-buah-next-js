"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getExpiryStatus } from "@/lib/utils/expiry";
import { MovementType, PaymentMethod, SaleStatus } from "@prisma/client";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { revalidatePath } from "next/cache";

export interface SalesFilterOptions {
  search?: string;
  datePreset?: string; // 'today' | '7days' | 'thisMonth' | 'custom' | 'all'
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  paymentMethod?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getSales(filters: SalesFilterOptions = {}) {
  const {
    search = "",
    datePreset = "all",
    startDate,
    endDate,
    cashierId = "all",
    paymentMethod = "all",
    status = "all",
    page = 1,
    limit = 10,
  } = filters;

  const whereClause: any = {};

  // Search filter (Invoice number or cashier name)
  if (search.trim()) {
    const searchLower = search.trim();
    whereClause.OR = [
      { invoiceNo: { contains: searchLower, mode: "insensitive" } },
      {
        cashier: {
          name: { contains: searchLower, mode: "insensitive" },
        },
      },
    ];
  }

  // Date filter
  const now = new Date();
  if (datePreset === "today") {
    whereClause.saleDate = {
      gte: startOfDay(now),
      lte: endOfDay(now),
    };
  } else if (datePreset === "7days") {
    whereClause.saleDate = {
      gte: startOfDay(subDays(now, 6)),
      lte: endOfDay(now),
    };
  } else if (datePreset === "thisMonth") {
    whereClause.saleDate = {
      gte: startOfMonth(now),
      lte: endOfMonth(now),
    };
  } else if (datePreset === "custom" && (startDate || endDate)) {
    whereClause.saleDate = {};
    if (startDate) {
      whereClause.saleDate.gte = startOfDay(new Date(startDate));
    }
    if (endDate) {
      whereClause.saleDate.lte = endOfDay(new Date(endDate));
    }
  }

  // Cashier filter
  if (cashierId && cashierId !== "all") {
    whereClause.cashierId = cashierId;
  }

  // Payment Method filter
  if (paymentMethod && paymentMethod !== "all") {
    whereClause.paymentMethod = paymentMethod as PaymentMethod;
  }

  // Status filter
  if (status && status !== "all") {
    whereClause.status = status as SaleStatus;
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Execute queries
  const [sales, totalCount, allSalesMatchingFilter, cashiers] = await Promise.all([
    db.sale.findMany({
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
        _count: {
          select: { items: true },
        },
      },
      orderBy: { saleDate: "desc" },
      skip: offset,
      take: limit,
    }),
    db.sale.count({ where: whereClause }),
    db.sale.findMany({
      where: whereClause,
      select: {
        totalAmount: true,
        status: true,
        items: {
          select: {
            profit: true,
          },
        },
      },
    }),
    db.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Aggregate metrics calculation
  let totalSalesAmount = 0;
  let totalProfitAmount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  for (const sale of allSalesMatchingFilter) {
    if (sale.status === SaleStatus.COMPLETED) {
      totalSalesAmount += sale.totalAmount;
      completedCount += 1;
      const saleProfit = sale.items.reduce((acc, item) => acc + (item.profit || 0), 0);
      totalProfitAmount += saleProfit;
    } else if (sale.status === SaleStatus.CANCELLED) {
      cancelledCount += 1;
    }
  }

  const avgTransactionValue = completedCount > 0 ? totalSalesAmount / completedCount : 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    sales,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
    metrics: {
      totalSalesAmount,
      totalProfitAmount,
      completedCount,
      cancelledCount,
      avgTransactionValue,
    },
    cashiers,
  };
}

export async function getSaleDetail(saleId: string) {
  if (!saleId) return null;

  const sale = await db.sale.findUnique({
    where: { id: saleId },
    include: {
      cashier: {
        select: { id: true, name: true, username: true },
      },
      items: {
        include: {
          fruit: true,
          stockBatch: true,
        },
      },
    },
  });

  return sale;
}

export async function cancelSale(saleId: string, reason: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Tidak memiliki hak akses." };
  }

  if (!reason.trim()) {
    return { success: false, error: "Alasan pembatalan wajib diisi." };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Fetch sale with items
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              fruit: true,
              stockBatch: true,
            },
          },
        },
      });

      if (!sale) {
        throw new Error("Transaksi tidak ditemukan.");
      }

      if (sale.status === SaleStatus.CANCELLED) {
        throw new Error("Transaksi ini sudah dibatalkan sebelumnya.");
      }

      // 2. Restore stock for each sale item
      for (const item of sale.items) {
        const batch = await tx.stockBatch.findUnique({
          where: { id: item.stockBatchId },
        });

        if (batch) {
          const newQuantity = batch.currentQuantity + item.quantity;
          const newStatus = getExpiryStatus(batch.expiryDate, newQuantity);

          // Update StockBatch quantity and status
          await tx.stockBatch.update({
            where: { id: batch.id },
            data: {
              currentQuantity: newQuantity,
              status: newStatus,
            },
          });

          // Record StockMovement
          await tx.stockMovement.create({
            data: {
              type: MovementType.OUT_ADJUSTMENT,
              fruitId: item.fruitId,
              stockBatchId: item.stockBatchId,
              quantity: item.quantity,
              unit: item.fruit.unit,
              referenceNo: sale.invoiceNo,
              note: `Pembatalan transaksi ${sale.invoiceNo}: ${reason.trim()}`,
              createdById: session.id,
            },
          });
        }
      }

      // 3. Mark sale as CANCELLED
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.CANCELLED,
          note: `Dibatalkan oleh ${session.name || "Kasir"}: ${reason.trim()}`,
        },
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          type: "SYSTEM",
          title: "Transaksi Dibatalkan",
          message: `Transaksi ${sale.invoiceNo} senilai ${new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(sale.totalAmount)} telah dibatalkan.`,
          link: "/transaksi",
        },
      });

      return updatedSale;
    });

    revalidatePath("/transaksi");
    revalidatePath("/kasir");
    revalidatePath("/stok");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Transaksi ${result.invoiceNo} berhasil dibatalkan dan stok telah dikembalikan.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal membatalkan transaksi.",
    };
  }
}
