"use client";

import { Card } from "@/components/tailgrids/core/card";
import { BoxArchive1, CheckCircle1, InfoTriangle } from "@tailgrids/icons";

interface PenjualanStatsProps {
  summary: {
    totalSales: number;
    totalCostOfGoods: number;
    grossProfit: number;
    completedCount: number;
    avgBasketSize: number;
  };
}

export function PenjualanStats({ summary }: PenjualanStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statItems = [
    {
      title: "Total Omset Penjualan",
      value: formatCurrency(summary.totalSales),
      icon: BoxArchive1,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Total HPP (Modal Batch)",
      value: formatCurrency(summary.totalCostOfGoods),
      icon: InfoTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Estimasi Laba Kotor",
      value: formatCurrency(summary.grossProfit),
      icon: CheckCircle1,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Jumlah Transaksi",
      value: `${summary.completedCount} Transaksi`,
      icon: CheckCircle1,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="flex items-center justify-between p-4 shadow-xs">
            <div className="space-y-1 overflow-hidden">
              <p className="text-xs font-medium text-text-tertiary truncate">{stat.title}</p>
              <p className="text-xl font-bold text-text-primary truncate">{stat.value}</p>
            </div>
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <Icon className="size-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
