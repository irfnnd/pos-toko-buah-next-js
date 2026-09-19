"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Fruit, Supplier } from "@prisma/client";
import { addDays, format } from "date-fns";

interface StokInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fruitId: string;
    supplierId?: string | null;
    receiveDate: string;
    initialQuantity: number;
    unit: string;
    buyPrice: number;
    shelfLifeDays: number;
    expiryDate: string;
    note?: string | null;
  }) => Promise<void>;
  fruits: Fruit[];
  suppliers: Supplier[];
  isLoading?: boolean;
}

export function StokInModal({
  isOpen,
  onClose,
  onSubmit,
  fruits,
  suppliers,
  isLoading = false,
}: StokInModalProps) {
  const [fruitId, setFruitId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [receiveDate, setReceiveDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [initialQuantity, setInitialQuantity] = useState<number | "">(10);
  const [unit, setUnit] = useState("Kg");
  const [buyPrice, setBuyPrice] = useState<number | "">(0);
  const [shelfLifeDays, setShelfLifeDays] = useState<number | "">(14);
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto fill details when fruit selection changes
  const handleFruitChange = (selectedId: string) => {
    setFruitId(selectedId);
    const selectedFruit = fruits.find((f) => f.id === selectedId);
    if (selectedFruit) {
      setUnit(selectedFruit.unit);
      setBuyPrice(selectedFruit.defaultBuyPrice);
      setShelfLifeDays(selectedFruit.defaultShelfLifeDays);
    }
  };

  // Recalculate expiryDate when receiveDate or shelfLifeDays changes
  useEffect(() => {
    if (receiveDate && typeof shelfLifeDays === "number" && shelfLifeDays > 0) {
      const calculated = addDays(new Date(receiveDate), shelfLifeDays);
      setExpiryDate(format(calculated, "yyyy-MM-dd"));
    }
  }, [receiveDate, shelfLifeDays]);

  useEffect(() => {
    if (isOpen) {
      if (fruits.length > 0 && !fruitId) {
        handleFruitChange(fruits[0].id);
      }
      setReceiveDate(format(new Date(), "yyyy-MM-dd"));
      setNote("");
      setErrorMsg(null);
    }
  }, [isOpen, fruits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fruitId) {
      setErrorMsg("Pilih buah terlebih dahulu");
      return;
    }
    if (typeof initialQuantity !== "number" || initialQuantity <= 0) {
      setErrorMsg("Jumlah stok masuk harus lebih dari 0");
      return;
    }
    if (typeof buyPrice !== "number" || buyPrice < 0) {
      setErrorMsg("Harga beli tidak valid");
      return;
    }
    if (typeof shelfLifeDays !== "number" || shelfLifeDays < 1) {
      setErrorMsg("Masa simpan minimal 1 hari");
      return;
    }

    try {
      await onSubmit({
        fruitId,
        supplierId: supplierId || null,
        receiveDate,
        initialQuantity,
        unit,
        buyPrice,
        shelfLifeDays,
        expiryDate,
        note: note.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat mencatat stok masuk");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Input Stok Masuk Baru (Batch)</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Pilih Buah <span className="text-red-500">*</span>
              </label>
              <select
                value={fruitId}
                onChange={(e) => handleFruitChange(e.target.value)}
                required
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="" disabled>-- Pilih Buah --</option>
                {fruits.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Pilih Supplier (Opsional)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="">-- Tanpa Supplier / Pembelian Langsung --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Tanggal Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Jumlah Masuk <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
                />
                <span className="flex items-center rounded-xl bg-gray-100 px-3 text-xs font-semibold text-text-secondary dark:bg-gray-800">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Harga Beli Batch (Rp/{unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Masa Simpan (Hari) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Tanggal Batas Masa Simpan (Otomatis) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3 py-2 text-sm font-semibold text-emerald-600 focus:border-primary-500 focus:outline-none dark:text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Catatan Stok Masuk (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Kondisi buah sangat segar, pasokan dari kebun A..."
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
          <Button type="submit" isDisabled={isLoading}>
            {isLoading ? "Menyimpan Batch..." : "Simpan Stok Masuk"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
