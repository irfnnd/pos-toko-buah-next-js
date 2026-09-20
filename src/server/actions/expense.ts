"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { endOfDay, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

export interface ExpenseFilterOptions {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export async function getExpenses(filters: ExpenseFilterOptions = {}) {
  const { startDate, endDate, category } = filters;
  const whereClause: any = {};

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) {
      whereClause.date.gte = startOfDay(new Date(startDate));
    }
    if (endDate) {
      whereClause.date.lte = endOfDay(new Date(endDate));
    }
  }

  if (category && category !== "ALL") {
    whereClause.category = category;
  }

  const expenses = await db.expense.findMany({
    where: whereClause,
    include: {
      createdBy: {
        select: { id: true, name: true, username: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return {
    expenses,
    totalExpense,
  };
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category?: string;
  date?: string;
  note?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Tidak memiliki hak akses." };
  }

  if (!data.title?.trim()) {
    return { success: false, error: "Judul pengeluaran wajib diisi." };
  }

  if (!data.amount || data.amount <= 0) {
    return { success: false, error: "Nominal pengeluaran harus lebih dari 0." };
  }

  try {
    const expense = await db.expense.create({
      data: {
        title: data.title.trim(),
        amount: Number(data.amount),
        category: data.category?.trim() || "Operasional",
        date: data.date ? new Date(data.date) : new Date(),
        note: data.note?.trim() || null,
        createdById: session.id,
      },
    });

    revalidatePath("/laporan/laba-rugi");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengeluaran operasional berhasil dicatat.",
      data: expense,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal menyimpan pengeluaran operasional.",
    };
  }
}

export async function deleteExpense(expenseId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Tidak memiliki hak akses." };
  }

  try {
    await db.expense.delete({
      where: { id: expenseId },
    });

    revalidatePath("/laporan/laba-rugi");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pengeluaran operasional berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal menghapus pengeluaran operasional.",
    };
  }
}
