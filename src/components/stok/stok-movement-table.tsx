"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Fruit, MovementType, StockBatch, StockMovement } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowAngularDownLeft, ArrowAngularTopRight, BoxArchive1 } from "@tailgrids/icons";

type MovementWithRelations = StockMovement & {
  fruit: Fruit;
  stockBatch?: StockBatch | null;
  createdBy?: { name: string; username: string } | null;
};

interface StokMovementTableProps {
  movements: MovementWithRelations[];
  isLoading?: boolean;
}

export function StokMovementTable({ movements, isLoading }: StokMovementTableProps) {
  const renderTypeBadge = (type: MovementType) => {
    switch (type) {
      case MovementType.IN:
        return (
          <Badge color="success" size="sm" prefixIcon={<ArrowAngularDownLeft className="size-3" />}>
            Stok Masuk
          </Badge>
        );
      case MovementType.OUT_SALE:
        return (
          <Badge color="blue" size="sm" prefixIcon={<ArrowAngularTopRight className="size-3" />}>
            Penjualan
          </Badge>
        );
      case MovementType.OUT_EXPIRED:
        return (
          <Badge color="error" size="sm" prefixIcon={<ArrowAngularTopRight className="size-3" />}>
            Busuk / Kadaluwarsa
          </Badge>
        );
      case MovementType.OUT_DAMAGED:
        return (
          <Badge color="warning" size="sm" prefixIcon={<ArrowAngularTopRight className="size-3" />}>
            Buah Rusak
          </Badge>
        );
      case MovementType.OUT_ADJUSTMENT:
        return (
          <Badge color="gray" size="sm" prefixIcon={<ArrowAngularTopRight className="size-3" />}>
            Koreksi Stok
          </Badge>
        );
      default:
        return <Badge color="gray" size="sm">{type}</Badge>;
    }
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

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-12 text-center">
        <BoxArchive1 className="mb-3 size-10 text-text-tertiary" />
        <h3 className="text-base font-semibold text-text-primary">Belum Ada Pergerakan Stok</h3>
        <p className="text-sm text-text-tertiary">Riwayat transaksi stok masuk dan keluar akan tampil di sini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="border-b border-card-border bg-gray-50/50 text-xs font-semibold text-text-tertiary uppercase dark:bg-gray-900/50">
          <tr>
            <th className="px-5 py-3.5">Tanggal & Waktu</th>
            <th className="px-5 py-3.5">Tipe Pergerakan</th>
            <th className="px-5 py-3.5">Buah</th>
            <th className="px-5 py-3.5">Jumlah</th>
            <th className="px-5 py-3.5">Referensi / Batch</th>
            <th className="px-5 py-3.5">Petugas</th>
            <th className="px-5 py-3.5">Catatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {movements.map((mov) => {
            const isIncoming = mov.type === MovementType.IN;

            return (
              <tr key={mov.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4 text-xs font-medium text-text-primary whitespace-nowrap">
                  {format(new Date(mov.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  {renderTypeBadge(mov.type)}
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-text-primary">{mov.fruit.name}</p>
                    <p className="text-xs font-mono text-text-tertiary">{mov.fruit.code}</p>
                  </div>
                </td>

                <td className="px-5 py-4 font-bold whitespace-nowrap">
                  <span className={isIncoming ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                    {isIncoming ? "+" : "-"}{mov.quantity} {mov.unit}
                  </span>
                </td>

                <td className="px-5 py-4 font-mono text-xs font-semibold text-text-secondary whitespace-nowrap">
                  {mov.referenceNo || mov.stockBatch?.batchNumber || "-"}
                </td>

                <td className="px-5 py-4 text-xs">
                  {mov.createdBy ? (
                    <span className="font-medium text-text-primary">{mov.createdBy.name}</span>
                  ) : (
                    <span className="text-text-tertiary">Sistem</span>
                  )}
                </td>

                <td className="px-5 py-4 text-xs text-text-tertiary max-w-xs truncate">
                  {mov.note || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
