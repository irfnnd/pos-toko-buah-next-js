"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/kasir";
import { ExpiryStatus, MovementType, PaymentMethod, SaleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
}

export async function getPosFruitsAction() {
  await requireAuth();

  try {
    const fruits = await db.fruit.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        batches: {
          where: {
            currentQuantity: { gt: 0 },
            status: { not: ExpiryStatus.MELEWATI_BATAS },
          },
          orderBy: { expiryDate: "asc" }, // FEFO
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: fruits, error: undefined as string | undefined };
  } catch (error) {
    console.error("Get POS fruits error:", error);
    return { success: false, data: [], error: "Gagal mengambil data produk POS" };
  }
}

export async function createSaleTransactionAction(formData: unknown) {
  const cashier = await requireAuth();

  const parseResult = checkoutSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Data transaksi tidak valid",
    };
  }

  const { paymentMethod, totalAmount, paidAmount, changeAmount, note, items } = parseResult.data;

  if (paidAmount < totalAmount) {
    return {
      success: false,
      error: `Uang bayar (Rp ${paidAmount.toLocaleString("id-ID")}) kurang dari total tagihan (Rp ${totalAmount.toLocaleString("id-ID")})`,
    };
  }

  try {
    const saleTransaction = await db.$transaction(async (tx) => {
      // 1. Verify batch stock availability
      for (const item of items) {
        const batch = await tx.stockBatch.findUnique({
          where: { id: item.stockBatchId },
        });

        if (!batch || batch.currentQuantity < item.quantity) {
          throw new Error(
            `Stok batch (${batch?.batchNumber || "Tidak ditemukan"}) tidak mencukupi untuk diproses.`
          );
        }
      }

      // 2. Generate Invoice Number
      const invoiceNo = generateInvoiceNumber();

      // 3. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNo,
          cashierId: cashier.id,
          totalAmount,
          paidAmount,
          changeAmount,
          paymentMethod: paymentMethod as PaymentMethod,
          status: SaleStatus.COMPLETED,
          note: note?.trim() || null,
        },
      });

      // 4. Create SaleItems & Decrement StockBatches & Fruits
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            fruitId: item.fruitId,
            stockBatchId: item.stockBatchId,
            quantity: item.quantity,
            sellPrice: item.sellPrice,
            buyPrice: item.buyPrice,
            subtotal: item.subtotal,
            costTotal: item.costTotal,
            profit: item.profit,
          },
        });

        // Decrement Batch Quantity
        const updatedBatch = await tx.stockBatch.update({
          where: { id: item.stockBatchId },
          data: {
            currentQuantity: { decrement: item.quantity },
          },
        });

        // Update Batch Status to HABIS if 0
        if (updatedBatch.currentQuantity <= 0) {
          await tx.stockBatch.update({
            where: { id: item.stockBatchId },
            data: { status: ExpiryStatus.HABIS },
          });
        }

        // Record StockMovement (OUT_SALE)
        await tx.stockMovement.create({
          data: {
            type: MovementType.OUT_SALE,
            fruitId: item.fruitId,
            stockBatchId: item.stockBatchId,
            quantity: item.quantity,
            unit: updatedBatch.unit,
            referenceNo: invoiceNo,
            note: `Penjualan ${invoiceNo}`,
            createdById: cashier.id,
          },
        });

        // Decrement Fruit Total Stock
        await tx.fruit.update({
          where: { id: item.fruitId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });
      }

      // Fetch completed sale with details for receipt
      return await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          cashier: { select: { name: true, username: true } },
          items: {
            include: {
              fruit: true,
              stockBatch: true,
            },
          },
        },
      });
    });

    revalidatePath("/kasir");
    revalidatePath("/stok");
    revalidatePath("/buah");
    revalidatePath("/transaksi");

    return { success: true, data: saleTransaction };
  } catch (error: any) {
    console.error("Create sale transaction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memproses transaksi penjualan",
    };
  }
}
