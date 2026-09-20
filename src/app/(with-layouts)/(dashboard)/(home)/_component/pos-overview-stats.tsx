"use client";

import { Card } from "@/components/tailgrids/core/card";
import { BoxArchive1, CheckCircle1, InfoTriangle, XmarkCircle } from "@tailgrids/icons";
import Link from "next/link";

interface PosOverviewStatsProps {
  metrics: {
    penjualanHariIni: number;
    transaksiHariIni: number;
    labaHariIni: number;
    totalStok: number;
    mendekatiMasaSimpanCount: number;
    melewatiMasaSimpanCount: number;
  };
}

export default function PosOverviewStats({ metrics }: PosOverviewStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statItems = [
    {
      title: "Penjualan Hari Ini",
      value: formatCurrency(metrics.penjualanHariIni),
      desc: `${metrics.transaksiHariIni} transaksi hari ini`,
      icon: BoxArchive1,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
      link: "/transaksi",
    },
    {
      title: "Laba Hari Ini",
      value: formatCurrency(metrics.labaHariIni),
      desc: "Estimasi laba kotor hari ini",
      icon: CheckCircle1,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
      link: "/laporan/laba-rugi",
    },
    {
      title: "Total Stok Buah",
      value: `${metrics.totalStok} Unit/Kg`,
      desc: "Stok aktif dari semua batch",
      icon: BoxArchive1,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
      link: "/stok",
    },
    {
      title: "Buah Mendekati Masa Simpan",
      value: `${metrics.mendekatiMasaSimpanCount} Batch`,
      desc: "Segera melewati batas simpan",
      icon: InfoTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
      link: "/stok",
    },
    {
      title: "Buah Melewati Masa Simpan",
      value: `${metrics.melewatiMasaSimpanCount} Batch`,
      desc: "Perlu pemeriksaan / afkir",
      icon: XmarkCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
      link: "/stok",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Link key={idx} href={stat.link}>
            <Card className="flex items-center justify-between p-4 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer border border-card-border bg-card-surface-area">
              <div className="space-y-1 overflow-hidden">
                <p className="text-xs font-medium text-text-tertiary truncate">{stat.title}</p>
                <p className="text-lg font-bold text-text-primary truncate">{stat.value}</p>
                <p className="text-[11px] text-text-tertiary truncate">{stat.desc}</p>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="size-5" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
