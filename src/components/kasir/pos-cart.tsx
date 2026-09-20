"use client";

import { Button } from "@/components/tailgrids/core/button";
import { CartItem } from "@/lib/utils/fefo-cart";
import { Trash1, Plus, Minus, Cart2 } from "@tailgrids/icons";
import { format } from "date-fns";

interface PosCartProps {
  cart: CartItem[];
  onQuantityChange: (fruitId: string, delta: number) => void;
  onSetExactQuantity: (fruitId: string, exactQty: number) => void;
  onRemoveItem: (fruitId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function PosCart({
  cart,
  onQuantityChange,
  onSetExactQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: PosCartProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.totalSubtotal, 0);
  const rawTotalItemsCount = cart.reduce((sum, item) => sum + item.requestedQuantity, 0);
  const totalItemsCount = Math.round(rawTotalItemsCount * 100) / 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-card-border bg-card-surface-area shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border p-4 shrink-0 bg-card-surface-area">
        <div className="flex items-center gap-2 min-w-0">
          <Cart2 className="size-5 text-primary-600 dark:text-primary-400 shrink-0" />
          <h2 className="text-base font-bold text-text-primary truncate">Keranjang Belanja</h2>
          {cart.length > 0 && (
            <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-400">
              {cart.length} item
            </span>
          )}
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors ml-2"
          >
            Kosongkan
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-card-border/60 scrollbar-thin">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Cart2 className="mb-3 size-12 text-text-tertiary opacity-40" />
            <p className="text-sm font-semibold text-text-primary">Keranjang Kosong</p>
            <p className="text-xs text-text-tertiary max-w-[200px] mt-1">
              Pilih produk buah di sebelah kiri untuk ditambahkan ke keranjang.
            </p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div key={item.fruitId} className={idx > 0 ? "pt-3.5" : ""}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{item.fruitName}</h4>
                  <p className="text-xs text-text-tertiary">
                    {formatCurrency(item.sellPrice)} / {item.unit}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.fruitId)}
                  className="text-text-tertiary hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label="Hapus item"
                >
                  <Trash1 className="size-4" />
                </button>
              </div>

              {/* Allocated FEFO Batches List */}
              <div className="mt-2 space-y-1">
                {item.allocations.map((alloc) => (
                  <div
                    key={alloc.stockBatchId}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-text-secondary dark:bg-gray-800/60"
                  >
                    <span className="font-mono font-medium text-text-tertiary flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {alloc.batchNumber}
                    </span>
                    <span>
                      {Math.round(alloc.quantity * 100) / 100} {item.unit} (Exp: {format(new Date(alloc.expiryDate), "dd/MM/yy")})
                    </span>
                  </div>
                ))}
              </div>

              {/* Quantity Controls (Supports Decimal/Float Inputs) & Subtotal */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-xl border border-card-border p-1 bg-card-background">
                  <button
                    type="button"
                    onClick={() => onQuantityChange(item.fruitId, -1)}
                    title="Kurangi 1"
                    className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Minus className="size-3.5" />
                  </button>

                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.requestedQuantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        onSetExactQuantity(item.fruitId, val);
                      }
                    }}
                    className="w-16 text-center text-xs font-bold text-text-primary bg-transparent focus:outline-none focus:bg-card-surface-area focus:ring-1 focus:ring-primary-500 rounded py-0.5"
                    title="Ketik jumlah/berat desimal (cth: 0.5, 1.25, 2.5)"
                  />

                  <button
                    type="button"
                    onClick={() => onQuantityChange(item.fruitId, 1)}
                    title="Tambah 1"
                    className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs text-text-tertiary block font-mono">
                    {item.requestedQuantity} {item.unit}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.totalSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer & Checkout Trigger */}
      <div className="border-t border-card-border p-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-3 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>Total Kuantitas / Berat</span>
            <span className="font-semibold text-text-primary">{totalItemsCount} Unit/Kg</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-text-primary pt-1">
            <span>Total Belanja</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <Button
          size="lg"
          isDisabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full font-bold shadow-md rounded-xl py-3 text-sm sm:text-base"
        >
          Proses Pembayaran ({formatCurrency(totalAmount)})
        </Button>
      </div>
    </div>
  );
}
