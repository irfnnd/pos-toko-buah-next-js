import { z } from "zod";

export const stockInSchema = z.object({
  fruitId: z.string().min(1, "Buah wajib dipilih"),
  supplierId: z.string().optional().nullable(),
  receiveDate: z.string().min(1, "Tanggal masuk wajib diisi"),
  initialQuantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .positive("Jumlah stok masuk harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi").default("Kg"),
  buyPrice: z
    .number({ message: "Harga beli per satuan harus berupa angka" })
    .min(0, "Harga beli tidak boleh negatif"),
  shelfLifeDays: z
    .number({ message: "Masa simpan harus berupa angka" })
    .int("Masa simpan harus angka bulat")
    .min(1, "Masa simpan minimal 1 hari"),
  expiryDate: z.string().min(1, "Tanggal batas masa simpan wajib diisi"),
  note: z.string().optional().nullable(),
});

export const stockOutSchema = z.object({
  stockBatchId: z.string().min(1, "Batch stok wajib dipilih"),
  type: z.enum(["OUT_EXPIRED", "OUT_DAMAGED", "OUT_ADJUSTMENT"], {
    message: "Alasan stok keluar tidak valid",
  }),
  quantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .positive("Jumlah stok keluar harus lebih dari 0"),
  note: z.string().optional().nullable(),
});

export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
