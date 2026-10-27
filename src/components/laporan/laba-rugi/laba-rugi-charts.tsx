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
} from "recharts";

interface LabaRugiChartsProps {
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
  expenseBreakdown: Array<{
    category: string;
    total: number;
  }>;
}

const CATEGORY_COLORS = [
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#6B7280",
];

export function LabaRugiCharts({
  statement,
  expenseBreakdown,
}: LabaRugiChartsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);

  const inventoryLoss = statement.totalStockLoss ?? 0;

const pnlData = [
  {
    name: "Omzet",
    nominal: statement.totalSales,
    fill: "#10B981",
  },
  {
    name: "HPP",
    nominal: -statement.totalCostOfGoods,
    fill: "#64748B",
  },
  {
    name: "Laba Kotor",
    nominal: statement.grossProfit,
    fill: "#3B82F6",
  },
  {
    name: "Kerugian Stok",
    nominal: -inventoryLoss,
    fill: "#EF4444",
  },
  {
    name: "Biaya Operasional",
    nominal: -statement.totalExpenses,
    fill: "#F59E0B",
  },
  {
    name: "Laba Bersih",
    nominal: statement.netProfit,
    fill: statement.netProfit >= 0 ? "#059669" : "#DC2626",
  },
];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Grafik Perbandingan Laba Rugi */}
      <Card className="space-y-4 border border-card-border bg-card-surface-area p-5 shadow-xs lg:col-span-8">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">
            Perbandingan Struktur Laba Rugi
          </h3>
          <p className="text-xs text-text-tertiary">
            Omzet, HPP, laba kotor, kerugian stok, biaya operasional,
            dan laba bersih
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pnlData}
              margin={{ top: 20, right: 12, left: 12, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={55}
              />

              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(value) =>
                  `Rp${new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Math.abs(value))}`
                }
              />

              <Tooltip
                formatter={(value: number | string | undefined) => [
                  formatCurrency(Number(value ?? 0)),
                  "Nominal",
                ]}
              />

              <Bar dataKey="nominal" name="Nominal" radius={[6, 6, 0, 0]}>
                {pnlData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grafik Biaya Operasional */}
      <Card className="space-y-4 border border-card-border bg-card-surface-area p-5 shadow-xs lg:col-span-4">
        <div className="border-b border-card-border pb-3">
          <h3 className="text-base font-bold text-text-primary">
            Sebaran Biaya Operasional
          </h3>
          <p className="text-xs text-text-tertiary">
            Distribusi pengeluaran berdasarkan kategori
          </p>
        </div>

        <div className="flex h-80 w-full items-center justify-center">
          {expenseBreakdown.length === 0 ? (
            <div className="text-xs text-text-tertiary">
              Belum ada pengeluaran.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="total"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name ?? ""} ${(((percent ?? 0) * 100)).toFixed(0)}%`
                  }
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number | string | undefined) => [
                    formatCurrency(Number(value ?? 0)),
                    "Total",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}