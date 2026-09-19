"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Plus, Search1 as Search } from "@tailgrids/icons";

interface SupplierFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddClick: () => void;
}

export function SupplierFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
}: SupplierFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari nama, kode, atau telepon supplier..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-card-surface-area py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-xl border border-card-border bg-card-surface-area px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>
      </div>

      <Button onClick={onAddClick} className="gap-2">
        <Plus className="size-4" />
        Tambah Supplier
      </Button>
    </div>
  );
}
