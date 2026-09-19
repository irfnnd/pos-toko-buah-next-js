"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Plus, Minus, Search1 as Search } from "@tailgrids/icons";
import { Fruit, Supplier } from "@prisma/client";

interface StokFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  fruitFilter: string;
  onFruitFilterChange: (value: string) => void;
  supplierFilter: string;
  onSupplierFilterChange: (value: string) => void;
  fruits: Fruit[];
  suppliers: Supplier[];
  onAddStockInClick: () => void;
  onAddStockOutClick: () => void;
}

export function StokFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  fruitFilter,
  onFruitFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  fruits,
  suppliers,
  onAddStockInClick,
  onAddStockOutClick,
}: StokFilterProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        {/* Search input */}
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari no batch atau nama buah..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-card-surface-area py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-surface-area px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="ALL">Semua Status Masa Simpan</option>
          <option value="AMAN">Aman</option>
          <option value="SEGERA_BATAS">Segera Batas</option>
          <option value="MELEWATI_BATAS">Melewati Batas</option>
          <option value="HABIS">Habis</option>
        </select>

        {/* Fruit Filter */}
        <select
          value={fruitFilter}
          onChange={(e) => onFruitFilterChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-surface-area px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="ALL">Semua Buah</option>
          {fruits.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.code})
            </option>
          ))}
        </select>

        {/* Supplier Filter */}
        <select
          value={supplierFilter}
          onChange={(e) => onSupplierFilterChange(e.target.value)}
          className="rounded-xl border border-card-border bg-card-surface-area px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
        >
          <option value="ALL">Semua Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onAddStockOutClick} variant="primary" appearance="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40">
          <Minus className="size-4" />
          Stok Keluar / Koreksi
        </Button>
        <Button onClick={onAddStockInClick} className="gap-2">
          <Plus className="size-4" />
          Stok Masuk Baru
        </Button>
      </div>
    </div>
  );
}
