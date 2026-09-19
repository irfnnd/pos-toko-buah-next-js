"use server";

import { requireAdmin, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supplierSchema } from "@/lib/validations/supplier";
import { revalidatePath } from "next/cache";

export async function getSuppliersAction(params?: {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}) {
  await requireAuth();

  const search = params?.search?.trim();
  const status = params?.status;

  try {
    const suppliers = await db.supplier.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
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

    return { success: true, data: suppliers, error: undefined as string | undefined };
  } catch (error) {
    console.error("Get suppliers error:", error);
    return { success: false, data: [], error: "Gagal mengambil data supplier" };
  }
}

export async function createSupplierAction(formData: unknown) {
  await requireAdmin();

  const parseResult = supplierSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input data supplier tidak valid",
    };
  }

  const { code, name, phone, address, note, status } = parseResult.data;
  const normalizedCode = code.toUpperCase().trim();

  try {
    const existing = await db.supplier.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return { success: false, error: "Kode supplier sudah digunakan" };
    }

    const newSupplier = await db.supplier.create({
      data: {
        code: normalizedCode,
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        note: note?.trim() || null,
        status,
      },
    });

    revalidatePath("/supplier");
    return { success: true, data: newSupplier };
  } catch (error) {
    console.error("Create supplier error:", error);
    return { success: false, error: "Gagal membuat data supplier" };
  }
}

export async function updateSupplierAction(formData: unknown) {
  await requireAdmin();

  const parseResult = supplierSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Input data supplier tidak valid",
    };
  }

  const { id, code, name, phone, address, note, status } = parseResult.data;
  if (!id) {
    return { success: false, error: "ID supplier wajib ada" };
  }

  const normalizedCode = code.toUpperCase().trim();

  try {
    const existing = await db.supplier.findFirst({
      where: {
        code: normalizedCode,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Kode supplier telah digunakan supplier lain" };
    }

    const updatedSupplier = await db.supplier.update({
      where: { id },
      data: {
        code: normalizedCode,
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        note: note?.trim() || null,
        status,
      },
    });

    revalidatePath("/supplier");
    return { success: true, data: updatedSupplier };
  } catch (error) {
    console.error("Update supplier error:", error);
    return { success: false, error: "Gagal memperbarui supplier" };
  }
}

export async function toggleSupplierStatusAction(supplierId: string) {
  await requireAdmin();

  try {
    const supplier = await db.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    const updatedSupplier = await db.supplier.update({
      where: { id: supplierId },
      data: {
        status: supplier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });

    revalidatePath("/supplier");
    return { success: true, data: updatedSupplier };
  } catch (error) {
    console.error("Toggle supplier status error:", error);
    return { success: false, error: "Gagal mengubah status supplier" };
  }
}

export async function deleteSupplierAction(supplierId: string) {
  await requireAdmin();

  try {
    await db.supplier.delete({
      where: { id: supplierId },
    });

    revalidatePath("/supplier");
    return { success: true };
  } catch (error) {
    console.error("Delete supplier error:", error);
    return {
      success: false,
      error: "Gagal menghapus supplier (Mungkin masih digunakan pada batch stok)",
    };
  }
}
