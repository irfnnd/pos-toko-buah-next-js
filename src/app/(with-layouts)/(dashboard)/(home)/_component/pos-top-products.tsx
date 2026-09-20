"use client";

import { Card } from "@/components/tailgrids/core/card";

interface PosTopProductsProps {
  topProducts: Array<{
    fruitId: string;
    name: string;
    code: string;
    unit: string;
    totalQty: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
}

export default function PosTopProducts({ topProducts }: PosTopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <Card className="p-5 space-y-4 shadow-xs border border-card-border bg-card-surface-area">
      <div className="border-b border-card-border pb-3">
        <h3 className="text-base font-bold text-text-primary">Produk Buah Paling Laris</h3>
        <p className="text-xs text-text-tertiary">Peringkat 5 buah dengan penjualan tertinggi</p>
      </div>

      <div className="space-y-3">
        {topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-tertiary">
            Belum ada data penjualan produk.
          </div>
        ) : (
          topProducts.map((p, idx) => (
            <div
              key={p.fruitId}
              className="flex items-center justify-between rounded-xl border border-card-border/60 bg-gray-50/50 p-3 dark:bg-gray-800/40 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-bold text-text-primary">{p.name}</p>
                  <p className="text-text-tertiary font-mono">{p.code}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.totalRevenue)}
                </p>
                <p className="text-text-tertiary">
                  Terjual: <strong className="text-text-primary">{p.totalQty} {p.unit}</strong>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
