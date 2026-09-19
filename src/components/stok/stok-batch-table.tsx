"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { ExpiryStatus, Fruit, StockBatch, Supplier } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getRemainingDays } from "@/lib/utils/expiry";
import { BoxArchive1, Minus, InfoTriangle, CheckCircle1, XmarkCircle } from "@tailgrids/icons";

type StockBatchWithRelations = StockBatch & {
  fruit: Fruit;
  supplier?: Supplier | null;
};

interface StokBatchTableProps {
  batches: StockBatchWithRelations[];
  onStockOutClick: (batch: StockBatchWithRelations) => void;
  isLoading?: boolean;
}

export function StokBatchTable({ batches, onStockOutClick, isLoading }: StokBatchTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStatusBadge = (status: ExpiryStatus, remainingDays: number) => {
    switch (status) {
      case ExpiryStatus.AMAN:
        return (
          <Badge color="success" size="sm" prefixIcon={<CheckCircle1 className="size-3" />}>
            Aman ({remainingDays} hr lagi)
          </Badge>
        );
      case ExpiryStatus.SEGERA_BATAS:
        return (
          <Badge color="warning" size="sm" prefixIcon={<InfoTriangle className="size-3" />}>
            Segera Batas ({remainingDays} hr lagi)
          </Badge>
        );
      case ExpiryStatus.MELEWATI_BATAS:
        return (
          <Badge color="error" size="sm" prefixIcon={<XmarkCircle className="size-3" />}>
            Lewat Batas ({Math.abs(remainingDays)} hr lalu)
          </Badge>
        );
      case ExpiryStatus.HABIS:
        return (
          <Badge color="gray" size="sm">
            Stok Habis
          </Badge>
        );
      default:
        return <Badge color="gray" size="sm">{status}</Badge>;
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

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-12 text-center">
        <BoxArchive1 className="mb-3 size-10 text-text-tertiary" />
        <h3 className="text-base font-semibold text-text-primary">Tidak Ada Batch Stok</h3>
        <p className="text-sm text-text-tertiary">Belum ada batch stok yang sesuai dengan filter pencarian.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="border-b border-card-border bg-gray-50/50 text-xs font-semibold text-text-tertiary uppercase dark:bg-gray-900/50">
          <tr>
            <th className="px-5 py-3.5">No. Batch & Tgl Masuk</th>
            <th className="px-5 py-3.5">Buah</th>
            <th className="px-5 py-3.5">Supplier</th>
            <th className="px-5 py-3.5">Sisa / Awal Stok</th>
            <th className="px-5 py-3.5">Harga Beli Batch</th>
            <th className="px-5 py-3.5">Tgl Batas Simpan</th>
            <th className="px-5 py-3.5">Status Masa Simpan</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {batches.map((batch) => {
            const remainingDays = getRemainingDays(batch.expiryDate);
            const isDepleted = batch.currentQuantity <= 0;

            return (
              <tr key={batch.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-mono font-semibold text-text-primary">{batch.batchNumber}</p>
                    <p className="text-xs text-text-tertiary">
                      Masuk: {format(new Date(batch.receiveDate), "dd MMM yyyy", { locale: id })}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-text-primary">{batch.fruit.name}</p>
                    <p className="text-xs font-mono text-text-tertiary">{batch.fruit.code}</p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {batch.supplier ? (
                    <span className="text-xs font-medium text-text-secondary">{batch.supplier.name}</span>
                  ) : (
                    <span className="text-xs text-text-tertiary">-</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div>
                    <span className={`font-bold ${isDepleted ? "text-text-tertiary" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {batch.currentQuantity} {batch.unit}
                    </span>
                    <span className="text-xs text-text-tertiary block">
                      (Awal: {batch.initialQuantity} {batch.unit})
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 font-medium text-text-primary">
                  {formatCurrency(batch.buyPrice)} <span className="text-xs text-text-tertiary">/{batch.unit}</span>
                </td>

                <td className="px-5 py-4 text-xs">
                  <p className="font-semibold text-text-primary">
                    {format(new Date(batch.expiryDate), "dd MMM yyyy", { locale: id })}
                  </p>
                  <p className="text-text-tertiary">{batch.shelfLifeDays} hari masa simpan</p>
                </td>

                <td className="px-5 py-4">
                  {renderStatusBadge(batch.status, remainingDays)}
                </td>

                <td className="px-5 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    isDisabled={isDepleted}
                    onClick={() => onStockOutClick(batch)}
                    aria-label="Kurangi stok batch ini"
                    className="p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/50"
                  >
                    <Minus className="size-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
