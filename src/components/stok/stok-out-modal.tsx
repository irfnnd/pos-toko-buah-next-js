"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Fruit, StockBatch, Supplier } from "@prisma/client";

type StockBatchWithRelations = StockBatch & {
  fruit: Fruit;
  supplier?: Supplier | null;
};

interface StokOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stockBatchId: string;
    type: "OUT_EXPIRED" | "OUT_DAMAGED" | "OUT_ADJUSTMENT";
    quantity: number;
    note?: string | null;
  }) => Promise<void>;
  batches: StockBatchWithRelations[];
  selectedBatch?: StockBatchWithRelations | null;
  isLoading?: boolean;
}

export function StokOutModal({
  isOpen,
  onClose,
  onSubmit,
  batches,
  selectedBatch,
  isLoading = false,
}: StokOutModalProps) {
  const [stockBatchId, setStockBatchId] = useState("");
  const [type, setType] = useState<"OUT_EXPIRED" | "OUT_DAMAGED" | "OUT_ADJUSTMENT">("OUT_EXPIRED");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeBatches = batches.filter((b) => b.currentQuantity > 0);
  const currentSelectedBatch = activeBatches.find((b) => b.id === stockBatchId) || selectedBatch;

  useEffect(() => {
    if (isOpen) {
      if (selectedBatch) {
        setStockBatchId(selectedBatch.id);
      } else if (activeBatches.length > 0) {
        setStockBatchId(activeBatches[0].id);
      }
      setType("OUT_EXPIRED");
      setQuantity(1);
      setNote("");
      setErrorMsg(null);
    }
  }, [isOpen, selectedBatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!stockBatchId) {
      setErrorMsg("Pilih batch stok terlebih dahulu");
      return;
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      setErrorMsg("Jumlah stok keluar harus lebih dari 0");
      return;
    }
    if (currentSelectedBatch && quantity > currentSelectedBatch.currentQuantity) {
      setErrorMsg(
        `Jumlah keluar (${quantity} ${currentSelectedBatch.unit}) melebihi sisa stok batch (${currentSelectedBatch.currentQuantity} ${currentSelectedBatch.unit})`
      );
      return;
    }

    try {
      await onSubmit({
        stockBatchId,
        type,
        quantity,
        note: note.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat memproses stok keluar");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Stok Keluar / Koreksi (Busuk / Rusak / Opname)</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Pilih Batch Stok <span className="text-red-500">*</span>
            </label>
            <select
              value={stockBatchId}
              onChange={(e) => setStockBatchId(e.target.value)}
              required
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            >
              <option value="" disabled>-- Pilih Batch --</option>
              {activeBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} - {b.fruit.name} (Sisa: {b.currentQuantity} {b.unit})
                </option>
              ))}
            </select>
            {currentSelectedBatch && (
              <p className="mt-1 text-xs text-text-tertiary">
                Buah: <strong className="text-text-primary">{currentSelectedBatch.fruit.name}</strong> | Sisa Stok Batch: <strong className="text-emerald-600 dark:text-emerald-400">{currentSelectedBatch.currentQuantity} {currentSelectedBatch.unit}</strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Alasan Stok Keluar <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="OUT_EXPIRED">Buah Busuk / Melewati Masa Simpan</option>
                <option value="OUT_DAMAGED">Buah Rusak / Cacat Pasokan</option>
                <option value="OUT_ADJUSTMENT">Koreksi Stok / Opname</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Jumlah Keluar <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max={currentSelectedBatch?.currentQuantity || 9999}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
                />
                <span className="flex items-center rounded-xl bg-gray-100 px-3 text-xs font-semibold text-text-secondary dark:bg-gray-800">
                  {currentSelectedBatch?.unit || "Kg"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Catatan / Keterangan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Terkena jamur saat penyimpanan, penyusutan timbangan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="mt-4">
          <Button type="button" variant="primary" appearance="outline" onClick={onClose} isDisabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="danger" isDisabled={isLoading}>
            {isLoading ? "Memproses..." : "Proses Stok Keluar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
