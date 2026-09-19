"use server";

import { requireAdmin, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getExpiryStatus } from "@/lib/utils/expiry";
import { stockInSchema, stockOutSchema } from "@/lib/validations/stok";
import { ExpiryStatus, MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Generate a unique batch number formatted as BATCH-YYYYMMDD-XXXX
 */
function generateBatchNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MB-${dateStr}-${randomSuffix}`;
}

export async function getStockBatchesAction(params?: {
  search?: string;
  fruitId?: string;
  supplierId?: string;
  status?: ExpiryStatus | "ALL";
}) {
  await requireAuth();

  const search = params?.search?.trim();
  const fruitId = params?.fruitId;
  const supplierId = params?.supplierId;
  const status = params?.status;

  try {
    const batches = await db.stockBatch.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { batchNumber: { contains: search, mode: "insensitive" } },
                { fruit: { name: { contains: search, mode: "insensitive" } } },
                { fruit: { code: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(fruitId ? { fruitId } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        fruit: true,
        supplier: true,
      },
      orderBy: { expiryDate: "asc" }, // FEFO First Expired, First Out
    });

    // Dynamically verify and update expiry statuses if day has changed
    const updatedBatches = await Promise.all(
      batches.map(async (batch) => {
        const calculatedStatus = getExpiryStatus(batch.expiryDate, batch.currentQuantity);
        if (calculatedStatus !== batch.status) {
          return await db.stockBatch.update({
            where: { id: batch.id },
            data: { status: calculatedStatus },
            include: { fruit: true, supplier: true },
          });
        }
        return batch;
      })
    );

    return { success: true, data: updatedBatches, error: undefined as string | undefined };
  } catch (error) {
    console.error("Get stock batches error:", error);
    return { success: false, data: [], error: "Gagal mengambil data batch stok" };
  }
}

export async function createStockInAction(formData: unknown) {
  const user = await requireAuth();

  const parseResult = stockInSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input stok masuk tidak valid",
    };
  }

  const {
    fruitId,
    supplierId,
    receiveDate,
    initialQuantity,
    unit,
    buyPrice,
    shelfLifeDays,
    expiryDate,
    note,
  } = parseResult.data;

  try {
    const receiveDateTime = new Date(receiveDate);
    const expiryDateTime = new Date(expiryDate);
    const batchNumber = generateBatchNumber();
    const initialStatus = getExpiryStatus(expiryDateTime, initialQuantity);

    const result = await db.$transaction(async (tx) => {
      // 1. Create StockBatch
      const newBatch = await tx.stockBatch.create({
        data: {
          batchNumber,
          fruitId,
          supplierId: supplierId || null,
          receiveDate: receiveDateTime,
          initialQuantity,
          currentQuantity: initialQuantity,
          unit,
          buyPrice,
          shelfLifeDays,
          expiryDate: expiryDateTime,
          status: initialStatus,
          note: note?.trim() || null,
        },
      });

      // 2. Create StockMovement (IN)
      await tx.stockMovement.create({
        data: {
          type: MovementType.IN,
          fruitId,
          stockBatchId: newBatch.id,
          quantity: initialQuantity,
          unit,
          referenceNo: batchNumber,
          note: note?.trim() || `Stok masuk batch ${batchNumber}`,
          createdById: user.id,
        },
      });

      // 3. Increment Fruit.currentStock
      await tx.fruit.update({
        where: { id: fruitId },
        data: {
          currentStock: { increment: initialQuantity },
        },
      });

      return newBatch;
    });

    revalidatePath("/stok");
    revalidatePath("/buah");
    return { success: true, data: result };
  } catch (error) {
    console.error("Create stock in error:", error);
    return { success: false, error: "Gagal menyimpan data stok masuk" };
  }
}

export async function createStockOutAction(formData: unknown) {
  const user = await requireAuth();

  const parseResult = stockOutSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input stok keluar tidak valid",
    };
  }

  const { stockBatchId, type, quantity, note } = parseResult.data;

  try {
    const batch = await db.stockBatch.findUnique({
      where: { id: stockBatchId },
      include: { fruit: true },
    });

    if (!batch) {
      return { success: false, error: "Batch stok tidak ditemukan" };
    }

    if (quantity > batch.currentQuantity) {
      return {
        success: false,
        error: `Jumlah stok keluar (${quantity} ${batch.unit}) melebihi sisa stok batch (${batch.currentQuantity} ${batch.unit})`,
      };
    }

    const result = await db.$transaction(async (tx) => {
      const newQuantity = batch.currentQuantity - quantity;
      const newStatus = getExpiryStatus(batch.expiryDate, newQuantity);

      // 1. Update StockBatch
      const updatedBatch = await tx.stockBatch.update({
        where: { id: stockBatchId },
        data: {
          currentQuantity: newQuantity,
          status: newStatus,
        },
      });

      // 2. Create StockMovement
      await tx.stockMovement.create({
        data: {
          type: type as MovementType,
          fruitId: batch.fruitId,
          stockBatchId: batch.id,
          quantity,
          unit: batch.unit,
          referenceNo: batch.batchNumber,
          note: note?.trim() || `Stok keluar (${type}) dari batch ${batch.batchNumber}`,
          createdById: user.id,
        },
      });

      // 3. Decrement Fruit.currentStock
      await tx.fruit.update({
        where: { id: batch.fruitId },
        data: {
          currentStock: { decrement: quantity },
        },
      });

      return updatedBatch;
    });

    revalidatePath("/stok");
    revalidatePath("/buah");
    return { success: true, data: result };
  } catch (error) {
    console.error("Create stock out error:", error);
    return { success: false, error: "Gagal memproses stok keluar" };
  }
}

export async function getStockMovementsAction(params?: {
  search?: string;
  type?: MovementType | "ALL";
  fruitId?: string;
}) {
  await requireAuth();

  const search = params?.search?.trim();
  const type = params?.type;
  const fruitId = params?.fruitId;

  try {
    const movements = await db.stockMovement.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { referenceNo: { contains: search, mode: "insensitive" } },
                { note: { contains: search, mode: "insensitive" } },
                { fruit: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(type && type !== "ALL" ? { type } : {}),
        ...(fruitId ? { fruitId } : {}),
      },
      include: {
        fruit: true,
        stockBatch: true,
        createdBy: {
          select: { name: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: movements, error: undefined as string | undefined };
  } catch (error) {
    console.error("Get stock movements error:", error);
    return { success: false, data: [], error: "Gagal mengambil riwayat pergerakan stok" };
  }
}
