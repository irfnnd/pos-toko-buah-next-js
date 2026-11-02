"use client";

import { Card } from "@/components/tailgrids/core/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PosSalesChartProps {
  salesTrend7Days: Array<{ date: string; sales: number; profit: number }>;
}

export default function PosSalesChart({ salesTrend7Days }: PosSalesChartProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="p-5 space-y-4 shadow-xs border border-card-border bg-card-surface-area">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Grafik Penjualan & Laba (7 Hari Terakhir)</h3>
          <p className="text-xs text-text-tertiary">Perkembangan transaksi penjualan harian toko buah</p>
        </div>
      </div>

      <div className="h-72 w-full">
        {salesTrend7Days.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
            Belum ada data penjualan 7 hari terakhir.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashColorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashColorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rp${v / 1000}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === "sales" ? "Penjualan" : "Laba Kotor",
                ]}
              />
              <Legend formatter={(value) => (value === "sales" ? "Penjualan (Omset)" : "Laba Kotor")} />
              <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#dashColorSales)" />
              <Area type="monotone" dataKey="profit" stroke="#3B82F6" fillOpacity={1} fill="url(#dashColorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
