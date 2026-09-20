"use client";

import { Card } from "@/components/tailgrids/core/card";
import {
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

interface LabaRugiChartsProps {
  statement: {
    totalSales: number;
    totalCostOfGoods: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
  expenseBreakdown: Array<{ category: string; total: number }>;
}

const CATEGORY_COLORS = ["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#10B981", "#6B7280"];

export function LabaRugiCharts({ statement, expenseBreakdown }: LabaRugiChartsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const pnlData = [
    { name: "Omset Penjualan", nominal: statement.totalSales, fill: "#10B981" },
    { name: "Total HPP (Modal)", nominal: statement.totalCostOfGoods, fill: "#64748B" },
    { name: "Laba Kotor", nominal: statement.grossProfit, fill: "#3B82F6" },
    { name: "Pengeluaran Operasional", nominal: statement.totalExpenses, fill: "#F59E0B" },
    { name: "Laba Bersih", nominal: statement.netProfit, fill: statement.netProfit >= 0 ? "#059669" : "#DC2626" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* P&L Comparison Bar Chart (8 Cols) */}
      <Card className="lg:col-span-8 p-5 space-y-4 shadow-xs border border-card-border bg-card-surface-area">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">Perbandingan Struktur Laba Rugi</h3>
          <p className="text-xs text-text-tertiary">Komposisi Omset, HPP, Laba Kotor, Pengeluaran, dan Laba Bersih</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rp${v / 1000}k`} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Bar dataKey="nominal" radius={[8, 8, 0, 0]}>
                {pnlData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Breakdown Pie Chart (4 Cols) */}
      <Card className="lg:col-span-4 p-5 space-y-4 shadow-xs border border-card-border bg-card-surface-area">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">Sebaran Biaya Operasional</h3>
          <p className="text-xs text-text-tertiary">Distribusi pengeluaran berdasarkan kategori</p>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          {expenseBreakdown.length === 0 ? (
            <div className="text-xs text-text-tertiary">Belum ada pengeluaran.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="total"
                  nameKey="category"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
