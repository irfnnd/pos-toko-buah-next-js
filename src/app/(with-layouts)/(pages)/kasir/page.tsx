"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { allocateBatchesFEFO, CartItem, FruitWithBatches } from "@/lib/utils/fefo-cart";
import { PosProductGrid } from "@/components/kasir/pos-product-grid";
import { PosCart } from "@/components/kasir/pos-cart";
import { PosCheckoutModal } from "@/components/kasir/pos-checkout-modal";
import { PosReceiptModal } from "@/components/kasir/pos-receipt-modal";
import { createSaleTransactionAction, getPosFruitsAction } from "@/server/actions/kasir";

export default function KasirPage() {
  const [fruits, setFruits] = useState<FruitWithBatches[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  const fetchPosFruits = async () => {
    setIsLoading(true);
    try {
      const res = await getPosFruitsAction();
      if (res.success && res.data) {
        setFruits(res.data as FruitWithBatches[]);
      } else {
        toast.error(res.error || "Gagal mengambil katalog produk POS");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosFruits();
  }, []);

  const getCartQuantity = (fruitId: string): number => {
    const item = cart.find((i) => i.fruitId === fruitId);
    return item ? item.requestedQuantity : 0;
  };

  const handleAddToCart = (fruit: FruitWithBatches) => {
    const currentQty = getCartQuantity(fruit.id);
    const newQty = currentQty + 1;

    try {
      const allocations = allocateBatchesFEFO(fruit, newQty);
      const totalSubtotal = allocations.reduce((sum, a) => sum + a.subtotal, 0);
      const totalCost = allocations.reduce((sum, a) => sum + a.costTotal, 0);
      const totalProfit = totalSubtotal - totalCost;

      setCart((prev) => {
        const existingIdx = prev.findIndex((item) => item.fruitId === fruit.id);
        const newItem: CartItem = {
          fruitId: fruit.id,
          fruitCode: fruit.code,
          fruitName: fruit.name,
          unit: fruit.unit,
          sellPrice: fruit.sellPrice,
          requestedQuantity: newQty,
          allocations,
          totalSubtotal,
          totalCost,
          totalProfit,
        };

        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = newItem;
          return updated;
        } else {
          return [...prev, newItem];
        }
      });
    } catch (err: any) {
      toast.error(err?.message || `Gagal menambahkan ${fruit.name}`);
    }
  };

  const handleSetExactQuantity = (fruitId: string, targetQty: number) => {
    const fruit = fruits.find((f) => f.id === fruitId);
    if (!fruit) return;

    if (targetQty <= 0) {
      handleRemoveItem(fruitId);
      return;
    }

    const roundedQty = Math.round(targetQty * 100) / 100;

    try {
      const allocations = allocateBatchesFEFO(fruit, roundedQty);
      const totalSubtotal = allocations.reduce((sum, a) => sum + a.subtotal, 0);
      const totalCost = allocations.reduce((sum, a) => sum + a.costTotal, 0);
      const totalProfit = totalSubtotal - totalCost;

      setCart((prev) =>
        prev.map((item) =>
          item.fruitId === fruitId
            ? {
                ...item,
                requestedQuantity: roundedQty,
                allocations,
                totalSubtotal,
                totalCost,
                totalProfit,
              }
            : item
        )
      );
    } catch (err: any) {
      toast.error(err?.message || "Stok tidak mencukupi untuk penambahan kuantitas ini");
    }
  };

  const handleQuantityChange = (fruitId: string, delta: number) => {
    const currentQty = getCartQuantity(fruitId);
    const newQty = Math.max(0, Math.round((currentQty + delta) * 100) / 100);
    handleSetExactQuantity(fruitId, newQty);
  };

  const handleRemoveItem = (fruitId: string) => {
    setCart((prev) => prev.filter((item) => item.fruitId !== fruitId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSubmitCheckout = async (data: {
    paymentMethod: "CASH" | "QRIS" | "TRANSFER" | "OTHER";
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    note?: string | null;
    items: Array<{
      fruitId: string;
      stockBatchId: string;
      quantity: number;
      sellPrice: number;
      buyPrice: number;
      subtotal: number;
      costTotal: number;
      profit: number;
    }>;
  }) => {
    startTransition(async () => {
      const res = await createSaleTransactionAction(data);
      if (res.success && res.data) {
        toast.success("Transaksi penjualan berhasil disimpan");
        setCompletedSale(res.data);
        setIsCheckoutOpen(false);
        setCart([]);
        fetchPosFruits(); // Refresh stocks
        setIsReceiptOpen(true); // Open receipt modal
      } else {
        toast.error(res.error || "Gagal memproses transaksi penjualan");
        throw new Error(res.error);
      }
    });
  };

  return (
    <div className="mt-4 space-y-4 px-2 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Kasir Apps (POS)</h1>
        <p className="text-sm text-text-tertiary">
          Aplikasi kasir penjualan toko buah dengan alokasi stok otomatis berbasis FEFO
        </p>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Side: Product Catalog (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <PosProductGrid
            fruits={fruits}
            onAddToCart={handleAddToCart}
            getCartQuantity={getCartQuantity}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side: Shopping Cart Panel (4 cols - Sticky Fixed Position) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-2 lg:h-[calc(100vh-120px)]">
          <PosCart
            cart={cart}
            onQuantityChange={handleQuantityChange}
            onSetExactQuantity={handleSetExactQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* Checkout Modal */}
      <PosCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSubmit={handleSubmitCheckout}
        isLoading={isPending}
      />

      {/* Receipt Modal */}
      <PosReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
}
