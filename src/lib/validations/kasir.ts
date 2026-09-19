import { z } from "zod";

export const saleItemSchema = z.object({
  fruitId: z.string().min(1, "ID buah wajib ada"),
  stockBatchId: z.string().min(1, "ID batch stok wajib ada"),
  quantity: z.number().positive("Jumlah harus > 0"),
  sellPrice: z.number().min(0, "Harga jual tidak boleh negatif"),
  buyPrice: z.number().min(0, "Harga beli tidak boleh negatif"),
  subtotal: z.number().min(0),
  costTotal: z.number().min(0),
  profit: z.number(),
});

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER", "OTHER"], {
    message: "Metode pembayaran tidak valid",
  }),
  totalAmount: z.number().min(0, "Total transaksi tidak boleh negatif"),
  paidAmount: z.number().min(0, "Jumlah bayar tidak boleh negatif"),
  changeAmount: z.number().min(0, "Kembalian tidak boleh negatif"),
  note: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "Keranjang belanja tidak boleh kosong"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
