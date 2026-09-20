"use client";

import { PenjualanCharts } from "@/components/laporan/penjualan/penjualan-charts";
import { PenjualanFilter } from "@/components/laporan/penjualan/penjualan-filter";
import { PenjualanStats } from "@/components/laporan/penjualan/penjualan-stats";
import { PenjualanTable } from "@/components/laporan/penjualan/penjualan-table";
import { getCashiersAction, getSalesReport } from "@/server/actions/laporan";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function LaporanPenjualanPage() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cashierId, setCashierId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [cashiers, setCashiers] = useState<{ id: string; name: string }[]>([]);

  const [salesReport, setSalesReport] = useState<any>({
    summary: {
      totalSales: 0,
      totalCostOfGoods: 0,
      grossProfit: 0,
      completedCount: 0,
      avgBasketSize: 0,
    },
    dailySalesTrend: [],
    paymentDistribution: [],
    topFruits: [],
    sales: [],
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCashiersAction().then((res) => {
      if (res) setCashiers(res);
    });
  }, []);

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getSalesReport({
          datePreset,
          startDate,
          endDate,
          cashierId,
          paymentMethod,
        });
        setSalesReport(data);
      } catch (err: any) {
        toast.error("Gagal memuat data laporan penjualan.");
      }
    });
  }, [datePreset, startDate, endDate, cashierId, paymentMethod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setDatePreset("thisMonth");
    setStartDate("");
    setEndDate("");
    setCashierId("all");
    setPaymentMethod("all");
  };

  const handleExportCsv = () => {
    if (!salesReport.sales || salesReport.sales.length === 0) {
      toast.error("Tidak ada data penjualan untuk diekspor.");
      return;
    }

    const headers = [
      "No Invoice",
      "Tanggal & Waktu",
      "Kasir",
      "Jumlah Item",
      "Total Penjualan (Rp)",
      "Total HPP (Rp)",
      "Laba Kotor (Rp)",
      "Metode Pembayaran",
    ];

    const rows = salesReport.sales.map((s: any) => {
      const totalCost = s.items?.reduce((acc: number, i: any) => acc + (i.costTotal || 0), 0) || 0;
      const totalProfit = s.items?.reduce((acc: number, i: any) => acc + (i.profit || 0), 0) || 0;

      return [
        s.invoiceNo,
        `"${format(new Date(s.saleDate), "dd/MM/yyyy HH:mm", { locale: id })}"`,
        `"${s.cashier?.name || "Kasir"}"`,
        s.items?.length || 0,
        s.totalAmount,
        totalCost,
        totalProfit,
        s.paymentMethod,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("File CSV Laporan Penjualan berhasil diunduh.");
  };

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6 mb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Laporan Penjualan
        </h1>
        <p className="text-sm text-text-tertiary">
          Analisis omzet, detail HPP historis batch, estimasi laba kotor, dan sebaran pembayaran.
        </p>
      </div>

      {/* Summary Stats */}
      <PenjualanStats summary={salesReport.summary} />

      {/* Filter Toolbar */}
      <PenjualanFilter
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        cashierId={cashierId}
        onCashierIdChange={setCashierId}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cashiers={cashiers}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
      />

      {/* Recharts Analytics Section */}
      <PenjualanCharts
        dailySalesTrend={salesReport.dailySalesTrend}
        paymentDistribution={salesReport.paymentDistribution}
        topFruits={salesReport.topFruits}
      />

      {/* Sales Report Table */}
      <PenjualanTable sales={salesReport.sales} isLoading={isPending} />
    </div>
  );
}
