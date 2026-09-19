"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { SupplierStats } from "@/components/supplier/supplier-stats";
import { SupplierFilter } from "@/components/supplier/supplier-filter";
import { SupplierTable } from "@/components/supplier/supplier-table";
import { SupplierFormModal } from "@/components/supplier/supplier-form-modal";
import {
  getSuppliersAction,
  createSupplierAction,
  updateSupplierAction,
  toggleSupplierStatusAction,
  deleteSupplierAction,
} from "@/server/actions/supplier";
import { Supplier } from "@prisma/client";

type SupplierWithCount = Supplier & {
  _count?: { batches: number };
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierWithCount | null>(null);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await getSuppliersAction({
        search: search || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as "ACTIVE" | "INACTIVE") : undefined,
      });

      if (res.success && res.data) {
        setSuppliers(res.data as SupplierWithCount[]);
      } else {
        toast.error(res.error || "Gagal mengambil data supplier");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: SupplierWithCount) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSubmitSupplier = async (data: {
    id?: string;
    code: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    note?: string | null;
    status: "ACTIVE" | "INACTIVE";
  }) => {
    startTransition(async () => {
      if (data.id) {
        const res = await updateSupplierAction(data);
        if (res.success) {
          toast.success("Data supplier berhasil diperbarui");
          fetchSuppliers();
        } else {
          toast.error(res.error || "Gagal memperbarui data supplier");
          throw new Error(res.error);
        }
      } else {
        const res = await createSupplierAction(data);
        if (res.success) {
          toast.success("Data supplier baru berhasil ditambahkan");
          fetchSuppliers();
        } else {
          toast.error(res.error || "Gagal menambahkan data supplier");
          throw new Error(res.error);
        }
      }
    });
  };

  const handleToggleStatus = async (supplierId: string) => {
    try {
      const res = await toggleSupplierStatusAction(supplierId);
      if (res.success) {
        toast.success("Status supplier berhasil diubah");
        fetchSuppliers();
      } else {
        toast.error(res.error || "Gagal mengubah status supplier");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengubah status supplier");
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const res = await deleteSupplierAction(supplierId);
      if (res.success) {
        toast.success("Data supplier berhasil dihapus");
        fetchSuppliers();
      } else {
        toast.error(res.error || "Gagal menghapus data supplier");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus data supplier");
    }
  };

  // Stats calculation
  const total = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;
  const inactiveCount = suppliers.filter((s) => s.status === "INACTIVE").length;
  const totalBatchesSum = suppliers.reduce((acc, curr) => acc + (curr._count?.batches || 0), 0);

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Data Supplier</h1>
        <p className="text-sm text-text-tertiary">Kelola data mitra supplier & distributor pasokan buah</p>
      </div>

      <SupplierStats
        total={total}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        totalBatchesSum={totalBatchesSum}
      />

      <SupplierFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddClick={handleOpenAdd}
      />

      <SupplierTable
        suppliers={suppliers}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteSupplier}
        isLoading={isLoading}
      />

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSupplier}
        editingSupplier={editingSupplier}
        isLoading={isPending}
      />
    </div>
  );
}
