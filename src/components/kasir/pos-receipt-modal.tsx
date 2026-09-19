"use client";

import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Printer, CheckCircle1 } from "@tailgrids/icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
}

export function PosReceiptModal({ isOpen, onClose, sale }: PosReceiptModalProps) {
  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle1 className="size-5" />
          Transaksi Berhasil Diselesaikan!
        </DialogTitle>
      </DialogHeader>

      <DialogBody className="space-y-4">
        {/* Receipt Container for Printing */}
        <div id="printable-receipt" className="rounded-2xl border border-card-border bg-card-surface-area p-5 text-sm text-text-primary space-y-4 font-mono shadow-xs">
          {/* Header */}
          <div className="text-center border-b border-dashed border-card-border pb-3">
            <h2 className="text-lg font-bold uppercase tracking-wider text-text-primary">POS TOKO BUAH SEGAR</h2>
            <p className="text-xs text-text-tertiary">Jl. Buah Segar No. 88, Jakarta</p>
            <p className="text-xs text-text-tertiary">Telp/WA: 0812-3456-7890</p>
          </div>

          {/* Transaction Metadata */}
          <div className="text-xs space-y-1 border-b border-dashed border-card-border pb-3">
            <div className="flex justify-between">
              <span className="text-text-tertiary">No. Invoice:</span>
              <span className="font-bold">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Tanggal:</span>
              <span>{format(new Date(sale.saleDate), "dd MMM yyyy HH:mm", { locale: id })}</span>
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
              <div key={item.id} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>{item.fruit?.name || "Buah"}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-tertiary text-[11px]">
                  <span>
                    {item.quantity} {item.fruit?.unit || "Kg"} x {formatCurrency(item.sellPrice)}
                  </span>
                  <span>(Batch: {item.stockBatch?.batchNumber || "-"})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-text-tertiary">
              <span>Bayar ({sale.paymentMethod}):</span>
              <span>{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-text-tertiary">
              <span>Kembalian:</span>
              <span>{formatCurrency(sale.changeAmount)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center text-[11px] text-text-tertiary border-t border-dashed border-card-border pt-3">
            <p className="font-semibold text-text-secondary">Terima Kasih Atas Kunjungan Anda!</p>
            <p>Buah Segar Setiap Hari • Garansi Kualitas</p>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="mt-4">
        <Button variant="primary" appearance="outline" onClick={handlePrint} className="gap-2">
          <Printer className="size-4" />
          Cetak Struk
        </Button>
        <Button onClick={onClose}>
          Selesai / Transaksi Baru
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
