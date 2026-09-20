"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Printer, XmarkCircle, InfoTriangle } from "@tailgrids/icons";
import { PaymentMethod, SaleStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TransaksiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  onPrintReceipt: (sale: any) => void;
  onCancelSale: (sale: any) => void;
}

export function TransaksiDetailModal({
  isOpen,
  onClose,
  sale,
  onPrintReceipt,
  onCancelSale,
}: TransaksiDetailModalProps) {
  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const isCancelled = sale.status === SaleStatus.CANCELLED;

  const totalCost = sale.items?.reduce((acc: number, item: any) => acc + (item.costTotal || 0), 0) || 0;
  const totalProfit = sale.items?.reduce((acc: number, item: any) => acc + (item.profit || 0), 0) || 0;

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <div className="flex items-center justify-between w-full pr-4">
          <div>
            <DialogTitle className="text-xl font-bold font-mono text-text-primary">
              Invoice #{sale.invoiceNo}
            </DialogTitle>
            <p className="text-xs text-text-tertiary">
              {format(new Date(sale.saleDate), "dd MMMM yyyy, HH:mm:ss", { locale: id })}
            </p>
          </div>
          <div>
            {isCancelled ? (
              <Badge color="error">Dibatalkan</Badge>
            ) : (
              <Badge color="success">Selesai</Badge>
            )}
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Banner if cancelled */}
        {isCancelled && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs">
            <InfoTriangle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transaksi Ini Telah Dibatalkan</p>
              <p className="mt-0.5">{sale.note || "Stok telah dikembalikan ke inventory."}</p>
            </div>
          </div>
        )}

        {/* Metadata info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-card-border bg-card-surface-area p-4 text-xs">
          <div>
            <span className="text-text-tertiary block">Kasir</span>
            <span className="font-bold text-text-primary">{sale.cashier?.name || "Kasir"}</span>
          </div>
          <div>
            <span className="text-text-tertiary block">Metode Pembayaran</span>
            <span className="font-bold text-text-primary">{sale.paymentMethod}</span>
          </div>
          <div>
            <span className="text-text-tertiary block">Uang Bayar</span>
            <span className="font-bold text-text-primary">{formatCurrency(sale.paidAmount)}</span>
          </div>
          <div>
            <span className="text-text-tertiary block">Kembalian</span>
            <span className="font-bold text-text-primary">{formatCurrency(sale.changeAmount)}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary">Detail Buah & Batch FEFO</h4>
          <div className="overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-card-border bg-card-surface-area font-semibold text-text-tertiary uppercase">
                <tr>
                  <th className="px-3 py-2.5">Buah</th>
                  <th className="px-3 py-2.5">Batch Stock</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-right">Harga Jual</th>
                  <th className="px-3 py-2.5 text-right">Subtotal</th>
                  <th className="px-3 py-2.5 text-right">HPP (Modal)</th>
                  <th className="px-3 py-2.5 text-right">Laba Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border bg-card-surface-area text-text-primary">
                {sale.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 font-medium">
                      {item.fruit?.name} <span className="text-text-tertiary font-normal">({item.fruit?.code})</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-tertiary">
                      {item.stockBatch?.batchNumber || "-"}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold">
                      {item.quantity} {item.fruit?.unit || "Kg"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {formatCurrency(item.sellPrice)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-text-tertiary">
                      {formatCurrency(item.costTotal)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="rounded-xl border border-card-border bg-card-surface-area p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Total Omset Penjualan:</span>
            <span className="font-bold text-text-primary text-sm">{formatCurrency(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-card-border pt-2">
            <span className="text-text-tertiary">Total HPP / Modal Batch:</span>
            <span className="font-medium text-text-secondary">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between border-t border-card-border pt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <span>Estimasi Laba Kotor:</span>
            <span>{formatCurrency(totalProfit)}</span>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
        <div className="flex items-center gap-2">
          <Button
            appearance="outline"
            className="gap-2"
            onClick={() => onPrintReceipt(sale)}
          >
            <Printer className="size-4" />
            Cetak Struk
          </Button>

          {!isCancelled && (
            <Button
              appearance="outline"
              className="gap-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              onClick={() => {
                onClose();
                onCancelSale(sale);
              }}
            >
              <XmarkCircle className="size-4" />
              Batalkan Transaksi
            </Button>
          )}
        </div>

        <Button appearance="outline" onClick={onClose}>
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
