"use client";

import { Card } from "@/components/tailgrids/core/card";
import { AppleBrandIcon, CheckCircle1, InfoTriangle, BoxArchive1 } from "@tailgrids/icons";

interface FruitStatsProps {
  totalJenis: number;
  activeCount: number;
  lowStockCount: number;
  totalStockSum: number;
}

export function FruitStats({
  totalJenis,
  activeCount,
  lowStockCount,
  totalStockSum,
}: FruitStatsProps) {
  const statItems = [
    {
      title: "Total Jenis Buah",
      value: totalJenis,
      icon: AppleBrandIcon,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Buah Aktif",
      value: activeCount,
      icon: CheckCircle1,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Stok Menipis (≤ Min)",
      value: lowStockCount,
      icon: InfoTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Total Stok Keseluruhan",
      value: `${totalStockSum.toLocaleString("id-ID")} Unit`,
      icon: BoxArchive1,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-text-tertiary">{stat.title}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
            <div className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}>
              <Icon className="size-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
