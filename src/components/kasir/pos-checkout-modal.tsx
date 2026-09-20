"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { CartItem } from "@/lib/utils/fefo-cart";
import { Doller, CreditCard, CheckCircle1 } from "@tailgrids/icons";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onSubmit: (data: {
    paymentMethod: "CASH" | "QRIS" | "TRANSFER" | "OTHER";
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    note?: string | null;
    items: Array<{
      fruitId: string;
      stockBatchId: string;
      quantity: number;
      sellPrice: number;
      buyPrice: number;
      subtotal: number;
      costTotal: number;
      profit: number;
    }>;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function PosCheckoutModal({
  isOpen,
  onClose,
  cart,
  onSubmit,
  isLoading = false,
}: PosCheckoutModalProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.totalSubtotal, 0);

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER" | "OTHER">("CASH");
  const [paidAmount, setPaidAmount] = useState<number | "">(totalAmount);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("CASH");
      setPaidAmount(totalAmount);
      setNote("");
      setErrorMsg(null);
    }
  }, [isOpen, totalAmount]);

  useEffect(() => {
    if (paymentMethod !== "CASH") {
      setPaidAmount(totalAmount);
    }
  }, [paymentMethod, totalAmount]);

  const numericPaid = typeof paidAmount === "number" ? paidAmount : 0;
  const changeAmount = Math.max(0, numericPaid - totalAmount);
  const isPaidSufficient = paymentMethod !== "CASH" || numericPaid >= totalAmount;

  const quickCashOptions = [
    totalAmount,
    10000,
    20000,
    50000,
    100000,
    200000,
  ].filter((val, idx, self) => val >= totalAmount && self.indexOf(val) === idx).slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (paymentMethod === "CASH" && numericPaid < totalAmount) {
      setErrorMsg(`Uang bayar kurang dari total belanja ${formatCurrency(totalAmount)}`);
      return;
    }

    const saleItems = cart.flatMap((item) =>
      item.allocations.map((alloc) => ({
        fruitId: item.fruitId,
        stockBatchId: alloc.stockBatchId,
        quantity: alloc.quantity,
        sellPrice: alloc.sellPrice,
        buyPrice: alloc.buyPrice,
        subtotal: alloc.subtotal,
        costTotal: alloc.costTotal,
        profit: alloc.profit,
      }))
    );

    try {
      await onSubmit({
        paymentMethod,
        totalAmount,
        paidAmount: paymentMethod === "CASH" ? numericPaid : totalAmount,
        changeAmount: paymentMethod === "CASH" ? changeAmount : 0,
        note: note.trim() || null,
        items: saleItems,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat memproses transaksi");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-xl!">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-text-primary">
          Pembayaran Penjualan POS
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-3.5 py-3">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Compact Total Tagihan Banner */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-card-border">
            <div>
              <span className="text-xs font-semibold text-text-tertiary block">Total Tagihan</span>
              <span className="text-[11px] text-text-secondary">{cart.length} Jenis Produk</span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Payment Method Options (Horizontal Grid) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "CASH", label: "Tunai", icon: Doller },
                { id: "QRIS", label: "QRIS", icon: CreditCard },
                { id: "TRANSFER", label: "Transfer", icon: CreditCard },
                { id: "OTHER", label: "Lainnya", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400 ring-2 ring-primary-500/20"
                        : "border-card-border bg-card-surface-area text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Options (Compact 2-Column Grid) */}
          {paymentMethod === "CASH" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Left Column: Input Uang Bayar & Kembalian */}
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">
                    Jumlah Uang Bayar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={totalAmount}
                    required
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-xl border border-card-border bg-card-surface-area px-3 py-1.5 text-base font-bold text-text-primary focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="text-xs font-semibold">Kembalian</span>
                  <span className="text-base font-bold">{formatCurrency(changeAmount)}</span>
                </div>
              </div>

              {/* Right Column: Quick Nominal Buttons Grid */}
              <div>
                <span className="mb-1 block text-[11px] font-semibold text-text-tertiary">
                  Nominal Cepat:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPaidAmount(opt)}
                      className="rounded-lg border border-card-border bg-card-surface-area px-2 py-1.5 text-xs font-semibold text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
                    >
                      {opt === totalAmount ? "Uang Pas" : formatCurrency(opt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Catatan Transaksi */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">
              Catatan Transaksi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pembeli minta dibungkus kardus..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3 py-1.5 text-xs text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="pt-3 border-t border-card-border">
          <Button type="button" variant="primary" appearance="outline" onClick={onClose} isDisabled={isLoading} size="sm">
            Batal
          </Button>
          <Button type="submit" isDisabled={isLoading || !isPaidSufficient} size="sm" className="gap-2 font-bold">
            <CheckCircle1 className="size-4" />
            {isLoading ? "Memproses..." : `Selesaikan Bayar (${formatCurrency(totalAmount)})`}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
