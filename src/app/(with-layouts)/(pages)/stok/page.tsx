"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { StokStats } from "@/components/stok/stok-stats";
import { StokFilter } from "@/components/stok/stok-filter";
import { StokBatchTable } from "@/components/stok/stok-batch-table";
import { StokMovementTable } from "@/components/stok/stok-movement-table";
import { StokInModal } from "@/components/stok/stok-in-modal";
import { StokOutModal } from "@/components/stok/stok-out-modal";
import { getFruitsAction } from "@/server/actions/buah";
import { getSuppliersAction } from "@/server/actions/supplier";
import {
  createStockInAction,
  createStockOutAction,
  getStockBatchesAction,
  getStockMovementsAction,
} from "@/server/actions/stok";
import { ExpiryStatus, Fruit, MovementType, StockBatch, StockMovement, Supplier } from "@prisma/client";
import { BoxArchive1, ClockThree as ClockIcon } from "@tailgrids/icons";

type BatchWithRelations = StockBatch & {
  fruit: Fruit;
  supplier?: Supplier | null;
};

type MovementWithRelations = StockMovement & {
  fruit: Fruit;
  stockBatch?: StockBatch | null;
  createdBy?: { name: string; username: string } | null;
};

export default function StokPage() {
  const [activeTab, setActiveTab] = useState<"batches" | "movements">("batches");

  // Master Data State
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Batches & Movements State
  const [batches, setBatches] = useState<BatchWithRelations[]>([]);
  const [movements, setMovements] = useState<MovementWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fruitFilter, setFruitFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [movementTypeFilter, setMovementTypeFilter] = useState("ALL");

  // Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [selectedOutBatch, setSelectedOutBatch] = useState<BatchWithRelations | null>(null);

  // Fetch Master Data
  useEffect(() => {
    const fetchMasters = async () => {
      const fruitRes = await getFruitsAction({ status: "ACTIVE" });
      if (fruitRes.success && fruitRes.data) {
        setFruits(fruitRes.data as Fruit[]);
      }

      const supRes = await getSuppliersAction({ status: "ACTIVE" });
      if (supRes.success && supRes.data) {
        setSuppliers(supRes.data as Supplier[]);
      }
    };
    fetchMasters();
  }, []);

  // Fetch Batches / Movements
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "batches") {
        const res = await getStockBatchesAction({
          search: search || undefined,
          status: statusFilter !== "ALL" ? (statusFilter as ExpiryStatus) : undefined,
          fruitId: fruitFilter !== "ALL" ? fruitFilter : undefined,
          supplierId: supplierFilter !== "ALL" ? supplierFilter : undefined,
        });

        if (res.success && res.data) {
          setBatches(res.data as BatchWithRelations[]);
        } else {
          toast.error(res.error || "Gagal mengambil data batch stok");
        }
      } else {
        const res = await getStockMovementsAction({
          search: search || undefined,
          type: movementTypeFilter !== "ALL" ? (movementTypeFilter as MovementType) : undefined,
          fruitId: fruitFilter !== "ALL" ? fruitFilter : undefined,
        });

        if (res.success && res.data) {
          setMovements(res.data as MovementWithRelations[]);
        } else {
          toast.error(res.error || "Gagal mengambil riwayat pergerakan stok");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, search, statusFilter, fruitFilter, supplierFilter, movementTypeFilter]);

  const handleOpenStockIn = () => {
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (batch?: BatchWithRelations) => {
    setSelectedOutBatch(batch || null);
    setIsStockOutOpen(true);
  };

  const handleSubmitStockIn = async (data: {
    fruitId: string;
    supplierId?: string | null;
    receiveDate: string;
    initialQuantity: number;
    unit: string;
    buyPrice: number;
    shelfLifeDays: number;
    expiryDate: string;
    note?: string | null;
  }) => {
    startTransition(async () => {
      const res = await createStockInAction(data);
      if (res.success) {
        toast.success("Stok masuk baru berhasil disimpan");
        fetchData();
      } else {
        toast.error(res.error || "Gagal menyimpan stok masuk");
        throw new Error(res.error);
      }
    });
  };

  const handleSubmitStockOut = async (data: {
    stockBatchId: string;
    type: "OUT_EXPIRED" | "OUT_DAMAGED" | "OUT_ADJUSTMENT";
    quantity: number;
    note?: string | null;
  }) => {
    startTransition(async () => {
      const res = await createStockOutAction(data);
      if (res.success) {
        toast.success("Stok keluar / koreksi berhasil diproses");
        fetchData();
      } else {
        toast.error(res.error || "Gagal memproses stok keluar");
        throw new Error(res.error);
      }
    });
  };

  // Stats calculation from batches
  const totalBatches = batches.length;
  const amanCount = batches.filter((b) => b.status === "AMAN").length;
  const segeraBatasCount = batches.filter((b) => b.status === "SEGERA_BATAS").length;
  const melewatiBatasCount = batches.filter((b) => b.status === "MELEWATI_BATAS").length;

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Data Stok & Batch FEFO</h1>
        <p className="text-sm text-text-tertiary">
          Kelola stok masuk per batch, pemantauan masa simpan (First Expired, First Out), stok keluar & koreksi
        </p>
      </div>

      <StokStats
        totalBatches={totalBatches}
        amanCount={amanCount}
        segeraBatasCount={segeraBatasCount}
        melewatiBatasCount={melewatiBatasCount}
      />

      {/* Tabs */}
      <div className="flex border-b border-card-border">
        <button
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "batches"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <BoxArchive1 className="size-4" />
          Daftar Batch Stok (FEFO)
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "movements"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <ClockIcon className="size-4" />
          Riwayat Pergerakan Stok
        </button>
      </div>

      {activeTab === "batches" ? (
        <>
          <StokFilter
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            fruitFilter={fruitFilter}
            onFruitFilterChange={setFruitFilter}
            supplierFilter={supplierFilter}
            onSupplierFilterChange={setSupplierFilter}
            fruits={fruits}
            suppliers={suppliers}
            onAddStockInClick={handleOpenStockIn}
            onAddStockOutClick={() => handleOpenStockOut()}
          />

          <StokBatchTable
            batches={batches}
            onStockOutClick={(batch) => handleOpenStockOut(batch)}
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Cari no referensi, catatan, atau nama buah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md rounded-xl border border-card-border bg-card-surface-area py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
              />

              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="rounded-xl border border-card-border bg-card-surface-area px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
              >
                <option value="ALL">Semua Tipe Pergerakan</option>
                <option value="IN">Stok Masuk</option>
                <option value="OUT_SALE">Penjualan</option>
                <option value="OUT_EXPIRED">Busuk / Kadaluwarsa</option>
                <option value="OUT_DAMAGED">Buah Rusak</option>
                <option value="OUT_ADJUSTMENT">Koreksi Stok</option>
              </select>
            </div>
          </div>

          <StokMovementTable movements={movements} isLoading={isLoading} />
        </>
      )}

      {/* Modals */}
      <StokInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        onSubmit={handleSubmitStockIn}
        fruits={fruits}
        suppliers={suppliers}
        isLoading={isPending}
      />

      <StokOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        onSubmit={handleSubmitStockOut}
        batches={batches}
        selectedBatch={selectedOutBatch}
        isLoading={isPending}
      />
    </div>
  );
}
