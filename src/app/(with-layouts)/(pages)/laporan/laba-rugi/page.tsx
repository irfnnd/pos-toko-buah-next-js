"use client";

import { ExpenseModal } from "@/components/laporan/laba-rugi/expense-modal";
import { ExpenseTable } from "@/components/laporan/laba-rugi/expense-table";
import { LabaRugiCharts } from "@/components/laporan/laba-rugi/laba-rugi-charts";
import { LabaRugiStatement } from "@/components/laporan/laba-rugi/laba-rugi-statement";
import { Button } from "@/components/tailgrids/core/button";
import { getProfitLossReport } from "@/server/actions/laporan";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function LaporanLabaRugiPage() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<any>({
    statement: {
      totalSales: 0,
      totalCostOfGoods: 0,
      grossProfit: 0,
      totalStockLoss: 0,
      expiredLoss: 0,
      damagedLoss: 0,
      totalExpenses: 0,
      netProfit: 0,
    },
    stockLossSummary: {
      expiredQuantity: 0,
      damagedQuantity: 0,
      expiredLoss: 0,
      damagedLoss: 0,
      totalStockLoss: 0,
    },
    stockLossDetails: [],
    expenseBreakdown: [],
    expenses: [],
    salesCount: 0,
  });

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getProfitLossReport({
          datePreset,
          startDate,
          endDate,
        });
        setReport(data);
      } catch (err: any) {
        toast.error("Gagal memuat laporan Laba Rugi.");
      }
    });
  }, [datePreset, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setDatePreset("thisMonth");
    setStartDate("");
    setEndDate("");
  };
  const handleExportExcel = () => {
    try {
      const statement = report.statement;

      const summaryData = [
        ["LAPORAN LABA RUGI TOKO BUAH"],
        ["Periode", getPeriodLabel()],
        [],
        ["Keterangan", "Jumlah (Rp)"],
        ["Pendapatan Penjualan", statement.totalSales],
        ["Harga Pokok Penjualan (HPP)", statement.totalCostOfGoods],
        ["Laba Kotor", statement.grossProfit],
        ["Kerugian Stok Buah Busuk/Rusak", statement.totalStockLoss ?? 0],
        ["Biaya Operasional", statement.totalExpenses],
        ["Laba/Rugi Bersih", statement.netProfit],
        ["Jumlah Transaksi", report.salesCount],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 40 }, { wch: 22 }];

      ["B5", "B6", "B7", "B8", "B9", "B10"].forEach((cell) => {
        if (summarySheet[cell]) {
          summarySheet[cell].z = '"Rp" #,##0;[Red]-"Rp" #,##0';
        }
      });

      const expenseRows = Array.isArray(report.expenses)
        ? report.expenses
        : [];

      const expenseSheet =
        expenseRows.length > 0
          ? XLSX.utils.json_to_sheet(expenseRows)
          : XLSX.utils.aoa_to_sheet([
              ["Tidak ada biaya operasional pada periode ini."],
            ]);

      const breakdownRows = Array.isArray(report.expenseBreakdown)
        ? report.expenseBreakdown
        : [];

      const breakdownSheet =
        breakdownRows.length > 0
          ? XLSX.utils.json_to_sheet(breakdownRows)
          : XLSX.utils.aoa_to_sheet([
              ["Tidak ada rincian kategori biaya."],
            ]);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Laba Rugi");
      XLSX.utils.book_append_sheet(workbook, expenseSheet, "Biaya Operasional");
      XLSX.utils.book_append_sheet(workbook, breakdownSheet, "Kategori Biaya");

      XLSX.writeFile(
        workbook,
        `laporan-laba-rugi-${getFilenamePeriod()}.xlsx`,
      );

      toast.success("Laporan Excel berhasil diekspor.");
    } catch (error) {
      console.error("Gagal mengekspor laporan:", error);
      toast.error("Gagal mengekspor laporan ke Excel.");
    }
  };

  const getPeriodLabel = () => {
    switch (datePreset) {
      case "today":
        return "Hari Ini";
      case "7days":
        return "7 Hari Terakhir";
      case "thisMonth":
        return "Bulan Ini";
      case "custom":
        return `${startDate || "-"} s/d ${endDate || "-"}`;
      default:
        return "Semua Periode";
    }
  };

  const getFilenamePeriod = () => {
    if (datePreset === "custom") {
      return `${startDate || "awal"}-sampai-${endDate || "akhir"}`;
    }

    return `${datePreset}-${new Date().toISOString().slice(0, 10)}`;
  };
  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6 mb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Laporan Laba Rugi Toko
        </h1>
        <p className="text-sm text-text-tertiary">
          Perhitungan rasional HPP historis batch, laba kotor, dan laba bersih operasional.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-text-tertiary">Periode Laporan:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="rounded-xl border border-card-border bg-card-background px-3 py-2 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="custom">Rentang Tanggal Custom</option>
            </select>

            <Button
              onClick={handleResetFilters}
              appearance="outline"
              size="sm"
              className="gap-2 text-xs font-medium text-text-secondary"
            >
              Reset
            </Button>
            <Button
              onClick={handleExportExcel}
              appearance="outline"
              size="sm"
              className="gap-2"
            >
              Export Excel
            </Button>
          </div>
        </div>

        {datePreset === "custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-card-border text-xs">
            <span className="font-medium text-text-tertiary">Rentang Tanggal:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-card-border bg-card-background px-2.5 py-1.5 text-text-primary focus:border-primary-500 focus:outline-none"
              />
              <span className="text-text-tertiary">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-card-border bg-card-background px-2.5 py-1.5 text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Financial Statement Card */}
      <LabaRugiStatement
        statement={report.statement}
        onAddExpenseClick={() => setIsExpenseModalOpen(true)}
      />

      {/* Recharts Analytics Charts */}
      <LabaRugiCharts
        statement={report.statement}
        expenseBreakdown={report.expenseBreakdown}
      />

      {/* Operational Expenses Table */}
      <ExpenseTable
        expenses={report.expenses}
        totalExpense={report.statement.totalExpenses}
        onRefresh={loadData}
      />

      {/* Expense Add Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
