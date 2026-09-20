"use client";

import { useState } from "react";
import { FruitWithBatches } from "@/lib/utils/fefo-cart";
import { PosProductCard } from "./pos-product-card";
import { Search1 as Search, AppleBrandIcon } from "@tailgrids/icons";

interface PosProductGridProps {
  fruits: FruitWithBatches[];
  onAddToCart: (fruit: FruitWithBatches) => void;
  getCartQuantity: (fruitId: string) => number;
  isLoading?: boolean;
}

export function PosProductGrid({
  fruits,
  onAddToCart,
  getCartQuantity,
  isLoading,
}: PosProductGridProps) {
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("ALL");

  // Extract unique units for filtering
  const units = Array.from(new Set(fruits.map((f) => f.unit)));

  const filteredFruits = fruits.filter((fruit) => {
    const matchesSearch =
      fruit.name.toLowerCase().includes(search.toLowerCase()) ||
      fruit.code.toLowerCase().includes(search.toLowerCase());
    const matchesUnit = unitFilter === "ALL" || fruit.unit === unitFilter;
    return matchesSearch && matchesUnit;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-64 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Category Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari buah atau kode produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-card-surface-area py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Unit Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setUnitFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              unitFilter === "ALL"
                ? "bg-primary-600 text-white"
                : "bg-card-surface-area border border-card-border text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Semua ({fruits.length})
          </button>
          {units.map((unit) => (
            <button
              key={unit}
              onClick={() => setUnitFilter(unit)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                unitFilter === unit
                  ? "bg-primary-600 text-white"
                  : "bg-card-surface-area border border-card-border text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredFruits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-16 text-center">
          <AppleBrandIcon className="mb-3 size-12 text-text-tertiary" />
          <h3 className="text-base font-semibold text-text-primary">Produk Tidak Ditemukan</h3>
          <p className="text-sm text-text-tertiary">Tidak ada produk buah yang sesuai dengan kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredFruits.map((fruit) => (
            <PosProductCard
              key={fruit.id}
              fruit={fruit}
              onAddToCart={onAddToCart}
              cartQuantity={getCartQuantity(fruit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
