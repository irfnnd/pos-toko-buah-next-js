"use client";

import { Card } from "@/components/tailgrids/core/card";
import { BoxArchive1, CheckCircle1, InfoTriangle, XmarkCircle } from "@tailgrids/icons";

interface StokStatsProps {
  totalBatches: number;
  amanCount: number;
  segeraBatasCount: number;
  melewatiBatasCount: number;
}

export function StokStats({
  totalBatches,
  amanCount,
  segeraBatasCount,
  melewatiBatasCount,
}: StokStatsProps) {
  const statItems = [
    {
      title: "Total Batch Stok",
      value: `${totalBatches} Batch`,
      icon: BoxArchive1,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Masa Simpan Aman",
      value: `${amanCount} Batch`,
      icon: CheckCircle1,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Segera Melewati Batas",
      value: `${segeraBatasCount} Batch`,
      icon: InfoTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Melewati Masa Simpan",
      value: `${melewatiBatasCount} Batch`,
      icon: XmarkCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
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
