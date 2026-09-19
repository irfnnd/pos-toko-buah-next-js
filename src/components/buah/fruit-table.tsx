"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Fruit } from "@prisma/client";
import { Edit2, Trash2, Power, Apple, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";

type FruitWithCount = Fruit & {
  _count?: { batches: number };
};

interface FruitTableProps {
  fruits: FruitWithCount[];
  onEdit: (fruit: FruitWithCount) => void;
  onToggleStatus: (fruitId: string) => void;
  onDelete: (fruitId: string) => void;
  isLoading?: boolean;
}

export function FruitTable({ fruits, onEdit, onToggleStatus, onDelete, isLoading }: FruitTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<FruitWithCount | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (fruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-12 text-center">
        <Apple className="mb-3 size-10 text-text-tertiary" />
        <h3 className="text-base font-semibold text-text-primary">Tidak Ada Data Buah</h3>
        <p className="text-sm text-text-tertiary">Belum ada buah yang terdaftar atau cocok dengan kata kunci pencarian.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-gray-50/50 text-xs font-semibold text-text-tertiary uppercase dark:bg-gray-900/50">
            <tr>
              <th className="px-5 py-3.5">Kode & Buah</th>
              <th className="px-5 py-3.5">Satuan</th>
              <th className="px-5 py-3.5">Harga Beli</th>
              <th className="px-5 py-3.5">Harga Jual</th>
              <th className="px-5 py-3.5">Stok Saat Ini</th>
              <th className="px-5 py-3.5">Masa Simpan</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {fruits.map((fruit) => {
              const isLowStock = fruit.currentStock <= fruit.minStock;

              return (
                <tr key={fruit.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {fruit.imageUrl ? (
                          <img src={fruit.imageUrl} alt={fruit.name} className="size-full rounded-lg object-cover" />
                        ) : (
                          <Apple className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{fruit.name}</p>
                        <p className="text-xs font-mono font-medium text-text-tertiary">{fruit.code}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-text-secondary dark:bg-gray-800">
                      {fruit.unit}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-text-primary font-medium">
                    {formatCurrency(fruit.defaultBuyPrice)}
                  </td>

                  <td className="px-5 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                    {formatCurrency(fruit.sellPrice)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-text-primary"}`}>
                        {fruit.currentStock} {fruit.unit}
                      </span>
                      {isLowStock && (
                        <span title={`Stok ≤ min stok (${fruit.minStock} ${fruit.unit})`}>
                          <AlertTriangle className="size-4 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-text-tertiary">
                    {fruit.defaultShelfLifeDays} hari
                  </td>

                  <td className="px-5 py-4">
                    {fruit.status === "ACTIVE" ? (
                      <Badge color="success" size="sm">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm">
                        Nonaktif
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(fruit.id)}
                        title={fruit.status === "ACTIVE" ? "Nonaktifkan Buah" : "Aktifkan Buah"}
                        className="p-1.5 text-text-tertiary hover:text-text-primary"
                      >
                        <Power className={`size-4 ${fruit.status === "ACTIVE" ? "text-emerald-600" : "text-gray-400"}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(fruit)}
                        title="Edit Buah"
                        className="p-1.5 text-text-tertiary hover:text-blue-600"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(fruit)}
                        title="Hapus Buah"
                        className="p-1.5 text-text-tertiary hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Hapus Data Buah</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.name}</strong> ({deleteTarget?.code})? Tindakan ini akan menghapus master data buah. Jika buah sudah terhubung ke batch/transaksi, hapus tidak diperbolehkan.
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
            Hapus Buah
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
