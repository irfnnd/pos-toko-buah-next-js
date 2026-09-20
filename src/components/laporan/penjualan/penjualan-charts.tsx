"use client";

import { Card } from "@/components/tailgrids/core/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PenjualanChartsProps {
  dailySalesTrend: Array<{ date: string; sales: number; profit: number; cost: number }>;
  paymentDistribution: Array<{ method: string; total: number; count: number }>;
  topFruits: Array<{ fruitName: string; fruitCode: string; unit: string; totalQty: number; totalRevenue: number; totalProfit: number }>;
}

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "#10B981", // Emerald
  QRIS: "#3B82F6", // Blue
  TRANSFER: "#8B5CF6", // Purple
  OTHER: "#6B7280", // Gray
};

export function PenjualanCharts({
  dailySalesTrend,
  paymentDistribution,
  topFruits,
}: PenjualanChartsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 1. Daily Sales & Profit Trend (8 Cols) */}
      <Card className="lg:col-span-8 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary">Tren Omset & Laba Kotor</h3>
            <p className="text-xs text-text-tertiary">Grafik perkembangan penjualan dan estimasi laba per hari</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {dailySalesTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
              Tidak ada data penjualan pada periode ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
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
                    name === "sales" ? "Omset Penjualan" : "Laba Kotor",
                  ]}
                />
                <Legend formatter={(value) => (value === "sales" ? "Omset Penjualan" : "Laba Kotor")} />
                <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 2. Payment Method Distribution (4 Cols) */}
      <Card className="lg:col-span-4 p-5 space-y-4 shadow-xs">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">Metode Pembayaran</h3>
          <p className="text-xs text-text-tertiary">Sebaran omzet berdasarkan metode bayar</p>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          {paymentDistribution.length === 0 ? (
            <div className="text-xs text-text-tertiary">Tidak ada data.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="method"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.method] || "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 3. Top 5 Products Bar Chart (12 Cols) */}
      <Card className="lg:col-span-12 p-5 space-y-4 shadow-xs">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">Top 5 Produk Buah Terlaris</h3>
          <p className="text-xs text-text-tertiary">Produk buah dengan omzet tertinggi pada periode laporan</p>
        </div>

        <div className="h-64 w-full">
          {topFruits.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
              Tidak ada data produk.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFruits} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tickFormatter={(v) => `Rp${v / 1000}k`} />
                <YAxis dataKey="fruitName" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "totalRevenue" ? formatCurrency(Number(value)) : `${value} Unit`,
                    name === "totalRevenue" ? "Total Omzet" : "Kuantitas Terjual",
                  ]}
                />
                <Bar dataKey="totalRevenue" fill="#10B981" radius={[0, 8, 8, 0]} name="totalRevenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
