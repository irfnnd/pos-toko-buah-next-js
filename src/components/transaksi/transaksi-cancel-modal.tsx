"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { cancelSale } from "@/server/actions/transaksi";
import { InfoTriangle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

interface TransaksiCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  onSuccess: () => void;
}

export function TransaksiCancelModal({
  isOpen,
  onClose,
  sale,
  onSuccess,
}: TransaksiCancelModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan pembatalan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await cancelSale(sale.id, reason.trim());
      if (res.success) {
        toast.success(res.message || "Transaksi berhasil dibatalkan.");
        setReason("");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Gagal membatalkan transaksi.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <form onSubmit={handleCancelSubmit}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <InfoTriangle className="size-5" />
            Konfirmasi Pembatalan Transaksi
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 text-xs">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30 text-red-800 dark:text-red-300 space-y-1">
            <p className="font-bold">Apakah Anda yakin ingin membatalkan transaksi ini?</p>
            <p>
              Stok dari setiap item dalam transaksi ini akan secara otomatis **dikembalikan (restored)** ke batch stok masing-masing.
            </p>
          </div>

          <div className="rounded-xl border border-card-border bg-card-surface-area p-3 space-y-1 font-mono">
            <div className="flex justify-between text-text-primary font-bold">
              <span>Invoice:</span>
              <span>{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Total Transaksi:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Contoh: Kesalahan input nominal, pelanggan batal membeli, dll..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-background p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-red-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Memproses..." : "Ya, Batalkan Transaksi"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
