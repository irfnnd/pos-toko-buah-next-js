"use server";

import { requireAdmin, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fruitSchema } from "@/lib/validations/buah";
import { revalidatePath } from "next/cache";

export async function getFruitsAction(params?: {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}) {
  await requireAuth();

  const search = params?.search?.trim();
  const status = params?.status;

  const fruits = await db.fruit.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { batches: true },
      },
    },
  });

  return { success: true, data: fruits };
}

export async function createFruitAction(formData: unknown) {
  await requireAdmin();

  const parseResult = fruitSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0].message,
    };
  }

  const {
    code,
    name,
    unit,
    defaultBuyPrice,
    sellPrice,
    minStock,
    defaultShelfLifeDays,
    status,
    imageUrl,
  } = parseResult.data;

  const normalizedCode = code.toUpperCase().trim();

  try {
    const existing = await db.fruit.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return { success: false, error: "Kode buah sudah digunakan" };
    }

    const newFruit = await db.fruit.create({
      data: {
        code: normalizedCode,
        name: name.trim(),
        unit: unit.trim(),
        defaultBuyPrice,
        sellPrice,
        minStock,
        defaultShelfLifeDays,
        status,
        imageUrl: imageUrl || null,
        currentStock: 0,
      },
    });

    revalidatePath("/buah");
    return { success: true, data: newFruit };
  } catch (error) {
    console.error("Create fruit error:", error);
    return { success: false, error: "Gagal membuat data buah" };
  }
}

export async function updateFruitAction(formData: unknown) {
  await requireAdmin();

  const parseResult = fruitSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0].message,
    };
  }

  const {
    id,
    code,
    name,
    unit,
    defaultBuyPrice,
    sellPrice,
    minStock,
    defaultShelfLifeDays,
    status,
    imageUrl,
  } = parseResult.data;

  if (!id) {
    return { success: false, error: "ID buah wajib ada" };
  }

  const normalizedCode = code.toUpperCase().trim();

  try {
    const existing = await db.fruit.findFirst({
      where: {
        code: normalizedCode,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Kode buah sudah digunakan oleh buah lain" };
    }

    const updatedFruit = await db.fruit.update({
      where: { id },
      data: {
        code: normalizedCode,
        name: name.trim(),
        unit: unit.trim(),
        defaultBuyPrice,
        sellPrice,
        minStock,
        defaultShelfLifeDays,
        status,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/buah");
    return { success: true, data: updatedFruit };
  } catch (error) {
    console.error("Update fruit error:", error);
    return { success: false, error: "Gagal memperbarui data buah" };
  }
}

export async function toggleFruitStatusAction(fruitId: string) {
  await requireAdmin();

  try {
    const fruit = await db.fruit.findUnique({ where: { id: fruitId } });
    if (!fruit) {
      return { success: false, error: "Data buah tidak ditemukan" };
    }

    const updatedFruit = await db.fruit.update({
      where: { id: fruitId },
      data: {
        status: fruit.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });

    revalidatePath("/buah");
    return { success: true, data: updatedFruit };
  } catch (error) {
    console.error("Toggle fruit status error:", error);
    return { success: false, error: "Gagal mengubah status buah" };
  }
}

export async function deleteFruitAction(fruitId: string) {
  await requireAdmin();

  try {
    await db.fruit.delete({
      where: { id: fruitId },
    });

    revalidatePath("/buah");
    return { success: true };
  } catch (error) {
    console.error("Delete fruit error:", error);
    return { success: false, error: "Gagal menghapus data buah (Mungkin masih memiliki relasi stok/transaksi)" };
  }
}
