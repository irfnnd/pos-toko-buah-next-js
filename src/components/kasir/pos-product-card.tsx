"use client";

import { Button } from "@/components/tailgrids/core/button";
import { FruitWithBatches, getAvailableStockFEFO } from "@/lib/utils/fefo-cart";
import { AppleBrandIcon, Plus, InfoTriangle, XmarkCircle } from "@tailgrids/icons";

interface PosProductCardProps {
  fruit: FruitWithBatches;
  onAddToCart: (fruit: FruitWithBatches) => void;
  cartQuantity?: number;
}

export function PosProductCard({ fruit, onAddToCart, cartQuantity = 0 }: PosProductCardProps) {
  const availableStock = getAvailableStockFEFO(fruit);
  const remainingStock = Math.max(0, availableStock - cartQuantity);

  const hasWarningBatch = fruit.batches.some((b) => b.status === "SEGERA_BATAS");
  const isOutOfStock = remainingStock <= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
        isOutOfStock
          ? "border-card-border bg-gray-50/70 opacity-60 dark:bg-gray-900/40"
          : "border-card-border bg-card-surface-area shadow-xs hover:border-primary-400 hover:shadow-md"
      }`}
    >
      {/* Product Image & Badges */}
      <div>
        <div className="relative mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          {fruit.imageUrl ? (
            <img
              src={fruit.imageUrl}
              alt={fruit.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <AppleBrandIcon className="size-12 text-text-tertiary" />
          )}

          {/* Warnings & Stock Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasWarningBatch && !isOutOfStock && (
              <span className="flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                <InfoTriangle className="size-3" /> FEFO Batas
              </span>
            )}
            {isOutOfStock && (
              <span className="flex items-center gap-1 rounded-md bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                <XmarkCircle className="size-3" /> Stok Habis
              </span>
            )}
          </div>

          {cartQuantity > 0 && (
            <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-sm">
              {cartQuantity}
            </span>
          )}
        </div>

        {/* Title & Info */}
        <div className="space-y-1">
          <p className="text-xs font-mono font-medium text-text-tertiary">{fruit.code}</p>
          <h3 className="line-clamp-1 text-sm font-semibold text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {fruit.name}
          </h3>
          <p className="text-xs text-text-tertiary">
            Stok: <strong className={remainingStock <= fruit.minStock ? "text-amber-600" : "text-text-secondary"}>{remainingStock} {fruit.unit}</strong>
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-card-border pt-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-semibold text-text-tertiary block leading-none mb-0.5">Harga</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 truncate block">
            {formatCurrency(fruit.sellPrice)}
          </span>
        </div>

        <Button
          size="sm"
          isDisabled={isOutOfStock}
          onClick={() => onAddToCart(fruit)}
          className="shrink-0 gap-1 rounded-xl px-2.5 text-xs font-semibold whitespace-nowrap"
        >
          <Plus className="size-3.5" />
          Tambah
        </Button>
      </div>
    </div>
  );
}
