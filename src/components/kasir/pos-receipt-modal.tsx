"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Printer, Download1, CheckCircle1 } from "@tailgrids/icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/utils/cn";
import {
  printReceiptPdf,
  downloadReceiptPdf,
  ReceiptSaleData,
} from "@/lib/utils/receipt-pdf";
import { toast } from "sonner";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: ReceiptSaleData | any;
}

export function PosReceiptModal({ isOpen, onClose, sale }: PosReceiptModalProps) {
  const [paperWidth, setPaperWidth] = useState<58 | 80>(58);

  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isCancelled = sale.status === "CANCELLED";

  const handlePrint = () => {
    try {
      printReceiptPdf(sale, { paperWidth });
      toast.success(
        `Membuka cetak struk PDF (${paperWidth}mm mini thermal printer)...`
      );
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencetak struk");
    }
  };

  const handleDownload = () => {
    try {
      downloadReceiptPdf(sale, { paperWidth });
      toast.success(`Struk ${sale.invoiceNo} berhasil diunduh dalam format PDF`);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunduh file struk");
    }
  };

  const saleDateObj = sale.saleDate ? new Date(sale.saleDate) : new Date();
  const formattedDate = !isNaN(saleDateObj.getTime())
    ? format(saleDateObj, "dd MMM yyyy HH:mm", { locale: id })
    : "-";

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle1 className="size-5" />
          {isCancelled ? "Struk Transaksi (Dibatalkan)" : "Struk Transaksi Penjualan"}
        </DialogTitle>
      </DialogHeader>

      <DialogBody className="space-y-4">
        {/* Paper Size Selector */}
        <div className="flex items-center justify-between rounded-xl border border-card-border bg-background-gray-secondary/40 px-3 py-2 text-xs">
          <span className="font-medium text-text-secondary">
            Ukuran Kertas Printer:
          </span>
          <div className="inline-flex rounded-lg border border-card-border bg-card-surface-area p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setPaperWidth(58)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                paperWidth === 58
                  ? "bg-primary-500 text-white font-semibold shadow-xs"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              58mm (Mini Printer)
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth(80)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                paperWidth === 80
                  ? "bg-primary-500 text-white font-semibold shadow-xs"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              80mm (Standar POS)
            </button>
          </div>
        </div>

        {/* Receipt Container Preview */}
        <div
          className={cn(
            "mx-auto rounded-2xl border border-card-border bg-card-surface-area p-5 text-sm text-text-primary space-y-4 font-mono shadow-xs transition-all",
            paperWidth === 58 ? "max-w-[320px]" : "max-w-[420px]"
          )}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-card-border pb-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-text-primary">
              TOKO BUAH ANTON
            </h2>
            <p className="text-xs text-text-tertiary">Pauh Kambar</p>
            <p className="text-xs text-text-tertiary">Telp/WA: 0812-3456-7890</p>
          </div>

          {/* Cancellation Notice */}
          {isCancelled && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-2 text-center text-xs text-red-600 dark:text-red-400 font-bold">
              TRANSAKSI INI TELAH DIBATALKAN
            </div>
          )}

          {/* Transaction Metadata */}
          <div className="text-xs space-y-1 border-b border-dashed border-card-border pb-3">
            <div className="flex justify-between">
              <span className="text-text-tertiary">No. Invoice:</span>
              <span className="font-bold">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Tanggal:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Kasir:</span>
              <span>{sale.cashier?.name || "Kasir"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Metode:</span>
              <span className="font-semibold uppercase">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-2 border-b border-dashed border-card-border pb-3 text-xs">
            {sale.items?.map((item: any) => (
              <div key={item.id || `${item.fruitId}-${item.stockBatchId}`} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>{item.fruit?.name || "Buah"}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-tertiary text-[11px]">
                  <span>
                    {item.quantity} {item.fruit?.unit || "Kg"} x {formatCurrency(item.sellPrice)}
                  </span>
                  {item.stockBatch?.batchNumber && (
                    <span>(B: {item.stockBatch.batchNumber})</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-text-tertiary">
              <span>Bayar ({(sale.paymentMethod || "TUNAI").toUpperCase()}):</span>
              <span>{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-text-tertiary">
              <span>Kembalian:</span>
              <span>{formatCurrency(sale.changeAmount)}</span>
            </div>
          </div>

          {/* Optional Note */}
          {sale.note && sale.note.trim() && (
            <div className="text-[11px] text-text-tertiary border-t border-dashed border-card-border pt-2">
              <span className="font-semibold text-text-secondary">Catatan:</span>{" "}
              {sale.note.trim()}
            </div>
          )}

          {/* Footer message */}
          <div className="text-center text-[11px] text-text-tertiary border-t border-dashed border-card-border pt-3">
            <p className="font-semibold text-text-secondary">
              Terima Kasih Atas Kunjungan Anda!
            </p>
            <p>Buah Segar Setiap Hari • Garansi Kualitas</p>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer className="size-4" />
            Cetak Struk ({paperWidth}mm)
          </Button>
          <Button
            variant="primary"
            appearance="outline"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download1 className="size-4" />
            Unduh PDF
          </Button>
        </div>
        <Button variant="primary" appearance="ghost" onClick={onClose}>
          Tutup / Transaksi Baru
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
