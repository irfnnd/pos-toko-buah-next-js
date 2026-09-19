import { z } from "zod";

export const supplierSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .min(2, "Kode supplier minimal 2 karakter")
    .regex(/^[a-zA-Z0-9_-]+$/, "Kode hanya boleh angka, huruf, dan dash"),
  name: z.string().min(2, "Nama supplier minimal 2 karakter"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
