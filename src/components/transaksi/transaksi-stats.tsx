"use client";

import { Card } from "@/components/tailgrids/core/card";
import { BoxArchive1, CheckCircle1, InfoTriangle, XmarkCircle } from "@tailgrids/icons";

interface TransaksiStatsProps {
  metrics: {
    totalSalesAmount: number;
    totalProfitAmount: number;
    completedCount: number;
    cancelledCount: number;
    avgTransactionValue: number;
  };
}

export function TransaksiStats({ metrics }: TransaksiStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statItems = [
    {
      title: "Total Omset / Penjualan",
      value: formatCurrency(metrics.totalSalesAmount),
      icon: BoxArchive1,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Total Laba Kotor",
      value: formatCurrency(metrics.totalProfitAmount),
      icon: CheckCircle1,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Transaksi Selesai",
      value: `${metrics.completedCount} Transaksi`,
      icon: CheckCircle1,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      title: "Rata-rata Transaksi",
      value: formatCurrency(metrics.avgTransactionValue),
      icon: InfoTriangle,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      title: "Transaksi Dibatalkan",
      value: `${metrics.cancelledCount} Transaksi`,
      icon: XmarkCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="flex items-center justify-between p-4 shadow-xs">
            <div className="space-y-1 overflow-hidden">
              <p className="text-xs font-medium text-text-tertiary truncate">{stat.title}</p>
              <p className="text-lg font-bold text-text-primary truncate">{stat.value}</p>
            </div>
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <Icon className="size-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
