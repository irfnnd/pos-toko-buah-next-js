"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Fruit } from "@prisma/client";

interface FruitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    code: string;
    name: string;
    unit: string;
    defaultBuyPrice: number;
    sellPrice: number;
    minStock: number;
    defaultShelfLifeDays: number;
    status: "ACTIVE" | "INACTIVE";
    imageUrl?: string | null;
  }) => Promise<void>;
  editingFruit?: Fruit | null;
  isLoading?: boolean;
}

export function FruitFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingFruit,
  isLoading = false,
}: FruitFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("Kg");
  const [defaultBuyPrice, setDefaultBuyPrice] = useState<number | "">(0);
  const [sellPrice, setSellPrice] = useState<number | "">(0);
  const [minStock, setMinStock] = useState<number | "">(5);
  const [defaultShelfLifeDays, setDefaultShelfLifeDays] = useState<number | "">(14);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingFruit) {
      setCode(editingFruit.code);
      setName(editingFruit.name);
      setUnit(editingFruit.unit);
      setDefaultBuyPrice(editingFruit.defaultBuyPrice);
      setSellPrice(editingFruit.sellPrice);
      setMinStock(editingFruit.minStock);
      setDefaultShelfLifeDays(editingFruit.defaultShelfLifeDays);
      setStatus(editingFruit.status);
      setImageUrl(editingFruit.imageUrl || "");
    } else {
      setCode("");
      setName("");
      setUnit("Kg");
      setDefaultBuyPrice(0);
      setSellPrice(0);
      setMinStock(5);
      setDefaultShelfLifeDays(14);
      setStatus("ACTIVE");
      setImageUrl("");
    }
    setErrorMsg(null);
  }, [editingFruit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim()) {
      setErrorMsg("Kode buah wajib diisi");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Nama buah wajib diisi");
      return;
    }
    if (typeof defaultBuyPrice !== "number" || defaultBuyPrice < 0) {
      setErrorMsg("Harga beli default tidak valid");
      return;
    }
    if (typeof sellPrice !== "number" || sellPrice < 0) {
      setErrorMsg("Harga jual tidak valid");
      return;
    }
    if (typeof minStock !== "number" || minStock < 0) {
      setErrorMsg("Minimum stok tidak valid");
      return;
    }
    if (typeof defaultShelfLifeDays !== "number" || defaultShelfLifeDays < 1) {
      setErrorMsg("Masa simpan default minimal 1 hari");
      return;
    }

    try {
      await onSubmit({
        id: editingFruit?.id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        unit: unit.trim(),
        defaultBuyPrice,
        sellPrice,
        minStock,
        defaultShelfLifeDays,
        status,
        imageUrl: imageUrl.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat menyimpan data buah");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>{editingFruit ? "Edit Data Buah" : "Tambah Data Buah Baru"}</DialogTitle>
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
                Kode Buah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: APL-FUJI"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary uppercase focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Nama Buah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Apel Fuji Super"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Buah">Buah</option>
                <option value="Ikat">Ikat</option>
                <option value="Pack">Pack</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Harga Beli Default (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={defaultBuyPrice}
                onChange={(e) => setDefaultBuyPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Minimum Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Masa Simpan (Hari) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={defaultShelfLifeDays}
                onChange={(e) => setDefaultShelfLifeDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Status Buah <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              URL Foto Buah (Opsional)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="mt-4">
          <Button type="button" variant="primary" appearance="outline" onClick={onClose} isDisabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" isDisabled={isLoading}>
            {isLoading ? "Menyimpan..." : editingFruit ? "Simpan Perubahan" : "Tambah Data Buah"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
