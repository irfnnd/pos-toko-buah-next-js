"use client";

import { PosReceiptModal } from "@/components/kasir/pos-receipt-modal";
import { TransaksiCancelModal } from "@/components/transaksi/transaksi-cancel-modal";
import { TransaksiDetailModal } from "@/components/transaksi/transaksi-detail-modal";
import { TransaksiFilter } from "@/components/transaksi/transaksi-filter";
import { TransaksiStats } from "@/components/transaksi/transaksi-stats";
import { TransaksiTable } from "@/components/transaksi/transaksi-table";
import { getSaleDetail, getSales } from "@/server/actions/transaksi";
import { useCallback, useEffect, useState, useTransition } from "react";

export default function TransaksiPage() {
  // Filter States
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cashierId, setCashierId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Data States
  const [sales, setSales] = useState<any[]>([]);
  const [cashiers, setCashiers] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [metrics, setMetrics] = useState({
    totalSalesAmount: 0,
    totalProfitAmount: 0,
    completedCount: 0,
    cancelledCount: 0,
    avgTransactionValue: 0,
  });

  const [isPending, startTransition] = useTransition();

  // Modal States
  const [selectedDetailSale, setSelectedDetailSale] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedCancelSale, setSelectedCancelSale] = useState<any>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [selectedReceiptSale, setSelectedReceiptSale] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Fetch Sales Data
  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getSales({
        search,
        datePreset,
        startDate,
        endDate,
        cashierId,
        paymentMethod,
        status: statusFilter,
        page,
        limit: 10,
      });

      setSales(res.sales);
      setPagination(res.pagination);
      setMetrics(res.metrics);
      setCashiers(res.cashiers);
    });
  }, [
    search,
    datePreset,
    startDate,
    endDate,
    cashierId,
    paymentMethod,
    statusFilter,
    page,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleResetFilters = () => {
    setSearch("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setCashierId("all");
    setPaymentMethod("all");
    setStatusFilter("all");
    setPage(1);
  };

  const handleViewDetail = async (sale: any) => {
    // Fetch full sale detail including items
    const detail = await getSaleDetail(sale.id);
    setSelectedDetailSale(detail || sale);
    setIsDetailOpen(true);
  };

  const handlePrintReceipt = async (sale: any) => {
    const detail = await getSaleDetail(sale.id);
    setSelectedReceiptSale(detail || sale);
    setIsReceiptOpen(true);
  };

  const handleOpenCancel = (sale: any) => {
    setSelectedCancelSale(sale);
    setIsCancelOpen(true);
  };

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6 mb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Data Transaksi Penjualan
        </h1>
        <p className="text-sm text-text-tertiary">
          Riwayat lengkap transaksi, rincian laba kotor, rekap receipt, dan manajemen pembatalan transaksi.
        </p>
      </div>

      {/* Metrics Cards */}
      <TransaksiStats metrics={metrics} />

      {/* Filter Bar */}
      <TransaksiFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        datePreset={datePreset}
        onDatePresetChange={(val) => {
          setDatePreset(val);
          setPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(val) => {
          setStartDate(val);
          setPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(val) => {
          setEndDate(val);
          setPage(1);
        }}
        cashierId={cashierId}
        onCashierIdChange={(val) => {
          setCashierId(val);
          setPage(1);
        }}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={(val) => {
          setPaymentMethod(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        cashiers={cashiers}
        onResetFilters={handleResetFilters}
      />

      {/* Sales Table */}
      <TransaksiTable
        sales={sales}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onViewDetail={handleViewDetail}
        onPrintReceipt={handlePrintReceipt}
        onCancelSale={handleOpenCancel}
        isLoading={isPending}
      />

      {/* Detail Modal */}
      <TransaksiDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sale={selectedDetailSale}
        onPrintReceipt={handlePrintReceipt}
        onCancelSale={handleOpenCancel}
      />

      {/* Cancel Modal */}
      <TransaksiCancelModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        sale={selectedCancelSale}
        onSuccess={() => {
          loadData();
          setIsDetailOpen(false);
        }}
      />

      {/* Receipt Modal */}
      <PosReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedReceiptSale}
      />
    </div>
  );
}
