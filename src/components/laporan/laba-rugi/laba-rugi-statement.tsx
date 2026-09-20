"use client";

import { Card } from "@/components/tailgrids/core/card";
import { Button } from "@/components/tailgrids/core/button";
import { Plus } from "@tailgrids/icons";

interface LabaRugiStatementProps {
  statement: {
    totalSales: number;
    totalCostOfGoods: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
  onAddExpenseClick: () => void;
}

export function LabaRugiStatement({
  statement,
  onAddExpenseClick,
}: LabaRugiStatementProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const isNetProfitPositive = statement.netProfit >= 0;

  return (
    <Card className="p-6 space-y-6 shadow-xs border border-card-border bg-card-surface-area">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-card-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Laporan Keuangan Laba Rugi Toko</h2>
          <p className="text-xs text-text-tertiary">
            Rincian resmi pendapatan, HPP historis batch, laba kotor, dan laba bersih operasional.
          </p>
        </div>

        <Button onClick={onAddExpenseClick} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Tambah Biaya Operasional
        </Button>
      </div>

      {/* Financial Statement Breakdown Table */}
      <div className="space-y-3 font-mono text-sm">
        {/* 1. Total Penjualan */}
        <div className="flex items-center justify-between py-2 border-b border-card-border/60">
          <span className="font-semibold text-text-primary">1. Total Pendapatan Penjualan (Omset)</span>
          <span className="font-bold text-text-primary text-base">
            {formatCurrency(statement.totalSales)}
          </span>
        </div>

        {/* 2. Total HPP */}
        <div className="flex items-center justify-between py-2 border-b border-card-border/60 text-text-secondary pl-4">
          <span>(-) Total Harga Pokok Penjualan (HPP / Modal Batch)</span>
          <span className="font-semibold text-text-secondary">
            {formatCurrency(statement.totalCostOfGoods)}
          </span>
        </div>

        {/* 3. Laba Kotor */}
        <div className="flex items-center justify-between py-2.5 border-b-2 border-card-border bg-emerald-50/50 dark:bg-emerald-950/20 px-3 rounded-lg text-emerald-800 dark:text-emerald-300">
          <span className="font-bold">(=) LABA KOTOR (Gross Profit)</span>
          <span className="font-extrabold text-lg">
            {formatCurrency(statement.grossProfit)}
          </span>
        </div>

        {/* 4. Pengeluaran Operasional */}
        <div className="flex items-center justify-between py-2 border-b border-card-border/60 text-text-secondary pl-4">
          <span>(-) Total Biaya & Pengeluaran Operasional Toko</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(statement.totalExpenses)}
          </span>
        </div>

        {/* 5. Laba Bersih */}
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            isNetProfitPositive
              ? "border-emerald-300 bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200"
              : "border-red-300 bg-red-100/60 dark:border-red-800 dark:bg-red-950/60 text-red-900 dark:text-red-200"
          }`}
        >
          <div>
            <span className="font-extrabold text-base block">(=) LABA BERSIH (Net Profit)</span>
            <span className="text-xs opacity-80 font-sans">
              {isNetProfitPositive ? "Toko Memperoleh Keuntungan Net" : "Toko Mengalami Kerugian Net"}
            </span>
          </div>
          <span className="font-black text-2xl">
            {formatCurrency(statement.netProfit)}
          </span>
        </div>
      </div>
    </Card>
  );
}
