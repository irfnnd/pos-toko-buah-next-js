"use client";

import { Card } from "@/components/tailgrids/core/card";
import { Truck, CheckCircle2, XCircle, Boxes } from "lucide-react";

interface SupplierStatsProps {
  total: number;
  activeCount: number;
  inactiveCount: number;
  totalBatchesSum: number;
}

export function SupplierStats({
  total,
  activeCount,
  inactiveCount,
  totalBatchesSum,
}: SupplierStatsProps) {
  const statItems = [
    {
      title: "Total Supplier",
      value: total,
      icon: Truck,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Supplier Aktif",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Supplier Nonaktif",
      value: inactiveCount,
      icon: XCircle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Total Pasokan Batch",
      value: `${totalBatchesSum} Batch`,
      icon: Boxes,
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
