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
    totalStockLoss?: number;
    expiredLoss?: number;
    damagedLoss?: number;
    netProfit: number;
  };
  onAddExpenseClick: () => void;
}

export function LabaRugiStatement({
  statement,
  onAddExpenseClick,
}: LabaRugiStatementProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);

  const inventoryLoss = statement.totalStockLoss ?? 0;
  const netProfit = statement.netProfit;
  const isNetProfitPositive = netProfit >= 0;

  const rows = [
    {
      label: "Pendapatan Penjualan",
      description: "Total omzet penjualan",
      amount: statement.totalSales,
      type: "normal",
    },
    {
      label: "Harga Pokok Penjualan (HPP)",
      description: "Modal buah yang terjual berdasarkan batch",
      amount: statement.totalCostOfGoods,
      type: "deduction",
    },
    {
      label: "Laba Kotor",
      description: "Penjualan dikurangi HPP",
      amount: statement.grossProfit,
      type: "subtotal",
    },
    {
      label: "Kerugian Stok Buah",
      description: "Nilai pokok buah busuk, rusak, atau tidak layak jual",
      amount: inventoryLoss,
      type: "loss",
    },
    {
      label: "Biaya Operasional",
      description: "Biaya operasional toko di luar kerugian stok",
      amount: statement.totalExpenses,
      type: "deduction",
    },
  ] as const;

  return (
    <Card className="space-y-5 border border-card-border bg-card-surface-area p-4 shadow-xs sm:p-6">
      <div className="flex flex-col gap-4 border-b border-card-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary sm:text-xl">
            Laporan Laba Rugi
          </h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Ringkasan pendapatan, HPP, kerugian persediaan, dan biaya operasional.
          </p>
        </div>

        <Button
          onClick={onAddExpenseClick}
          className="flex shrink-0 items-center justify-center gap-2"
        >
          <Plus className="size-4" />
          Tambah Biaya Operasional
        </Button>
      </div>

      <div className="divide-y divide-card-border/60">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
              row.type === "subtotal"
                ? "my-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 dark:border-emerald-900 dark:bg-emerald-950/20"
                : row.type === "loss"
                  ? "px-1"
                  : ""
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-sm ${
                  row.type === "subtotal"
                    ? "font-bold text-emerald-800 dark:text-emerald-300"
                    : row.type === "loss"
                      ? "font-semibold text-red-700 dark:text-red-400"
                      : "font-medium text-text-primary"
                }`}
              >
                {row.type === "deduction" || row.type === "loss"
                  ? "(-) "
                  : row.type === "subtotal"
                    ? "(=) "
                    : ""}
                {row.label}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {row.description}
              </p>
            </div>

            <p
              className={`text-sm font-semibold tabular-nums sm:text-right ${
                row.type === "subtotal"
                  ? "text-base font-bold text-emerald-800 dark:text-emerald-300"
                  : row.type === "loss"
                    ? "text-red-700 dark:text-red-400"
                    : "text-text-primary"
              }`}
            >
              {formatCurrency(row.amount)}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
          isNetProfitPositive
            ? "border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
            : "border-red-300 bg-red-50/70 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
        }`}
      >
        <div>
          <h3 className="text-base font-extrabold">
            (=) {isNetProfitPositive ? "LABA BERSIH" : "RUGI BERSIH"}
          </h3>
          <p className="mt-1 text-xs opacity-80">
            {isNetProfitPositive
              ? "Toko memperoleh keuntungan pada periode ini."
              : "Pengeluaran dan kerugian melebihi pendapatan bersih."}
          </p>
        </div>

        <p className="text-2xl font-black tabular-nums sm:text-right">
          {formatCurrency(netProfit)}
        </p>
      </div>
    </Card>
  );
}
