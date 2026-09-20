"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Search1 as Search } from "@tailgrids/icons";

interface TransaksiFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  datePreset: string;
  onDatePresetChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  cashierId: string;
  onCashierIdChange: (val: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  cashiers: { id: string; name: string }[];
  onResetFilters: () => void;
}

export function TransaksiFilter({
  search,
  onSearchChange,
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  cashierId,
  onCashierIdChange,
  paymentMethod,
  onPaymentMethodChange,
  statusFilter,
  onStatusFilterChange,
  cashiers,
  onResetFilters,
}: TransaksiFilterProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-4 shadow-xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between flex-wrap">
        {/* Search input */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari no invoice atau nama kasir..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-card-background py-2 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Date Preset Filter */}
        <select
          value={datePreset}
          onChange={(e) => onDatePresetChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-background px-3 py-2 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="thisMonth">Bulan Ini</option>
          <option value="custom">Rentang Tanggal Custom</option>
        </select>

        {/* Cashier Filter */}
        <select
          value={cashierId}
          onChange={(e) => onCashierIdChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-background px-3 py-2 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Semua Kasir</option>
          {cashiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Payment Method Filter */}
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-background px-3 py-2 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Semua Metode Pembayaran</option>
          <option value="CASH">Tunai (CASH)</option>
          <option value="QRIS">QRIS</option>
          <option value="TRANSFER">Transfer Bank</option>
          <option value="OTHER">Lainnya</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-background px-3 py-2 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="COMPLETED">Selesai</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>

        {/* Reset Filter Button */}
        <Button
          onClick={onResetFilters}
          appearance="outline"
          className="gap-2 text-xs font-medium text-text-secondary"
        >
          Reset Filter
        </Button>
      </div>

      {/* Custom Date Inputs (only visible if datePreset === 'custom') */}
      {datePreset === "custom" && (
        <div className="flex items-center gap-3 pt-2 border-t border-card-border text-xs">
          <span className="font-medium text-text-tertiary">Rentang Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="rounded-lg border border-card-border bg-card-background px-2.5 py-1.5 text-text-primary focus:border-primary-500 focus:outline-none"
            />
            <span className="text-text-tertiary">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="rounded-lg border border-card-border bg-card-background px-2.5 py-1.5 text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
