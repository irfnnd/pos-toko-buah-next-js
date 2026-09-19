"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { FruitStats } from "@/components/buah/fruit-stats";
import { FruitFilter } from "@/components/buah/fruit-filter";
import { FruitTable } from "@/components/buah/fruit-table";
import { FruitFormModal } from "@/components/buah/fruit-form-modal";
import {
  getFruitsAction,
  createFruitAction,
  updateFruitAction,
  toggleFruitStatusAction,
  deleteFruitAction,
} from "@/server/actions/buah";
import { Fruit } from "@prisma/client";

type FruitWithCount = Fruit & {
  _count?: { batches: number };
};

export default function BuahPage() {
  const [fruits, setFruits] = useState<FruitWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFruit, setEditingFruit] = useState<FruitWithCount | null>(null);

  const fetchFruits = async () => {
    setIsLoading(true);
    try {
      const res = await getFruitsAction({
        search: search || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as "ACTIVE" | "INACTIVE") : undefined,
      });

      if (res.success && res.data) {
        setFruits(res.data as FruitWithCount[]);
      } else {
        toast.error(res.error || "Gagal mengambil data buah");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFruits();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingFruit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fruit: FruitWithCount) => {
    setEditingFruit(fruit);
    setIsModalOpen(true);
  };

  const handleSubmitFruit = async (data: {
    id?: string;
    code: string;
    name: string;
    unit: string;
    defaultBuyPrice: number;
    sellPrice: number;
    minStock: number;
    defaultShelfLifeDays: number;
    status: "ACTIVE" | "INACTIVE";
    imageUrl?: string | null;
  }) => {
    startTransition(async () => {
      if (data.id) {
        const res = await updateFruitAction(data);
        if (res.success) {
          toast.success("Data buah berhasil diperbarui");
          fetchFruits();
        } else {
          toast.error(res.error || "Gagal memperbarui data buah");
          throw new Error(res.error);
        }
      } else {
        const res = await createFruitAction(data);
        if (res.success) {
          toast.success("Data buah baru berhasil ditambahkan");
          fetchFruits();
        } else {
          toast.error(res.error || "Gagal menambahkan data buah");
          throw new Error(res.error);
        }
      }
    });
  };

  const handleToggleStatus = async (fruitId: string) => {
    try {
      const res = await toggleFruitStatusAction(fruitId);
      if (res.success) {
        toast.success("Status buah berhasil diubah");
        fetchFruits();
      } else {
        toast.error(res.error || "Gagal mengubah status buah");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengubah status buah");
    }
  };

  const handleDeleteFruit = async (fruitId: string) => {
    try {
      const res = await deleteFruitAction(fruitId);
      if (res.success) {
        toast.success("Data buah berhasil dihapus");
        fetchFruits();
      } else {
        toast.error(res.error || "Gagal menghapus data buah");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus data buah");
    }
  };

  // Stats calculation
  const totalJenis = fruits.length;
  const activeCount = fruits.filter((f) => f.status === "ACTIVE").length;
  const lowStockCount = fruits.filter((f) => f.currentStock <= f.minStock).length;
  const totalStockSum = fruits.reduce((acc, curr) => acc + curr.currentStock, 0);

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Data Buah</h1>
        <p className="text-sm text-text-tertiary">Kelola katalog buah, harga beli default, harga jual, dan min stok</p>
      </div>

      <FruitStats
        totalJenis={totalJenis}
        activeCount={activeCount}
        lowStockCount={lowStockCount}
        totalStockSum={totalStockSum}
      />

      <FruitFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddClick={handleOpenAdd}
      />

      <FruitTable
        fruits={fruits}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteFruit}
        isLoading={isLoading}
      />

      <FruitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitFruit}
        editingFruit={editingFruit}
        isLoading={isPending}
      />
    </div>
  );
}
