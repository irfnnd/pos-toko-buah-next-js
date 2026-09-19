import { z } from "zod";

export const fruitSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .min(2, "Kode buah minimal 2 karakter")
    .regex(/^[a-zA-Z0-9_-]+$/, "Kode hanya boleh angka, huruf, dan dash"),
  name: z.string().min(2, "Nama buah minimal 2 karakter"),
  unit: z.string().min(1, "Satuan wajib diisi").default("Kg"),
  defaultBuyPrice: z
    .number({ invalid_type_error: "Harga beli harus berupa angka" })
    .min(0, "Harga beli tidak boleh negatif"),
  sellPrice: z
    .number({ invalid_type_error: "Harga jual harus berupa angka" })
    .min(0, "Harga jual tidak boleh negatif"),
  minStock: z
    .number({ invalid_type_error: "Minimum stok harus berupa angka" })
    .min(0, "Minimum stok tidak boleh negatif")
    .default(5),
  defaultShelfLifeDays: z
    .number({ invalid_type_error: "Masa simpan harus berupa angka" })
    .int("Masa simpan harus angka bulat")
    .min(1, "Masa simpan minimal 1 hari")
    .default(14),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  imageUrl: z.string().optional().nullable(),
});

export type FruitInput = z.infer<typeof fruitSchema>;
