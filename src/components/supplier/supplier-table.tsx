"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Supplier } from "@prisma/client";
import { PenToSquare, Trash1, Reload, TruckDelivery2x, Telephone1, MapMarker5 } from "@tailgrids/icons";
import { useState } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";

type SupplierWithCount = Supplier & {
  _count?: { batches: number };
};

interface SupplierTableProps {
  suppliers: SupplierWithCount[];
  onEdit: (supplier: SupplierWithCount) => void;
  onToggleStatus: (supplierId: string) => void;
  onDelete: (supplierId: string) => void;
  isLoading?: boolean;
}

export function SupplierTable({
  suppliers,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading,
}: SupplierTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<SupplierWithCount | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-12 text-center">
        <TruckDelivery2x className="mb-3 size-10 text-text-tertiary" />
        <h3 className="text-base font-semibold text-text-primary">Tidak Ada Data Supplier</h3>
        <p className="text-sm text-text-tertiary">Belum ada supplier yang terdaftar atau cocok dengan pencarian.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-gray-50/50 text-xs font-semibold text-text-tertiary uppercase dark:bg-gray-900/50">
            <tr>
              <th className="px-5 py-3.5">Kode & Nama Supplier</th>
              <th className="px-5 py-3.5">No. Telepon</th>
              <th className="px-5 py-3.5">Alamat / Catatan</th>
              <th className="px-5 py-3.5">Total Batch</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {suppliers.map((sup) => (
              <tr key={sup.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                      <TruckDelivery2x className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{sup.name}</p>
                      <p className="text-xs font-mono font-medium text-text-tertiary">{sup.code}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {sup.phone ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                      <Telephone1 className="size-3.5 text-text-tertiary" />
                      {sup.phone}
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">-</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="max-w-xs space-y-0.5">
                    {sup.address && (
                      <div className="flex items-start gap-1 text-xs text-text-secondary truncate">
                        <MapMarker5 className="mt-0.5 size-3.5 shrink-0 text-text-tertiary" />
                        <span className="truncate">{sup.address}</span>
                      </div>
                    )}
                    {sup.note && (
                      <p className="text-xs italic text-text-tertiary truncate">{sup.note}</p>
                    )}
                    {!sup.address && !sup.note && <span className="text-xs text-text-tertiary">-</span>}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                    {sup._count?.batches || 0} Batch
                  </span>
                </td>

                <td className="px-5 py-4">
                  {sup.status === "ACTIVE" ? (
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
                      onClick={() => onToggleStatus(sup.id)}
                      aria-label={sup.status === "ACTIVE" ? "Nonaktifkan Supplier" : "Aktifkan Supplier"}
                      className="p-1.5 text-text-tertiary hover:text-text-primary"
                    >
                      <Reload className={`size-4 ${sup.status === "ACTIVE" ? "text-emerald-600" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(sup)}
                      aria-label="Edit Supplier"
                      className="p-1.5 text-text-tertiary hover:text-blue-600"
                    >
                      <PenToSquare className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(sup)}
                      aria-label="Hapus Supplier"
                      className="p-1.5 text-text-tertiary hover:text-red-600"
                    >
                      <Trash1 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Hapus Supplier</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Apakah Anda yakin ingin menghapus supplier <strong>{deleteTarget?.name}</strong> ({deleteTarget?.code})? Tindakan ini tidak dapat dibatalkan jika supplier belum memiliki relasi batch stok.
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" appearance="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus Supplier
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
