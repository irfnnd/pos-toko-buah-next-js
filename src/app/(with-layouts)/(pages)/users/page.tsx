"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserStats } from "@/components/users/user-stats";
import { UserFilter } from "@/components/users/user-filter";
import { UserTable } from "@/components/users/user-table";
import { UserFormModal } from "@/components/users/user-form-modal";
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  deleteUserAction,
} from "@/server/actions/users";

export type SafeUser = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "KASIR";
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

export default function UsersPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getUsersAction({
        search: search || undefined,
        role: roleFilter !== "ALL" ? (roleFilter as "ADMIN" | "KASIR") : undefined,
        status: statusFilter !== "ALL" ? (statusFilter as "ACTIVE" | "INACTIVE") : undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data as SafeUser[]);
      } else {
        toast.error(res.error || "Gagal mengambil data pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SafeUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (data: {
    id?: string;
    name: string;
    username: string;
    password?: string;
    role: "ADMIN" | "KASIR";
    status: "ACTIVE" | "INACTIVE";
  }) => {
    startTransition(async () => {
      if (data.id) {
        const res = await updateUserAction(data);
        if (res.success) {
          toast.success("Data pengguna berhasil diperbarui");
          fetchUsers();
        } else {
          toast.error(res.error || "Gagal memperbarui pengguna");
          throw new Error(res.error);
        }
      } else {
        const res = await createUserAction(data);
        if (res.success) {
          toast.success("Pengguna baru berhasil ditambahkan");
          fetchUsers();
        } else {
          toast.error(res.error || "Gagal membuat pengguna");
          throw new Error(res.error);
        }
      }
    });
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await toggleUserStatusAction(userId);
      if (res.success) {
        toast.success("Status pengguna berhasil diubah");
        fetchUsers();
      } else {
        toast.error(res.error || "Gagal mengubah status pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengubah status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await deleteUserAction(userId);
      if (res.success) {
        toast.success("Pengguna berhasil dihapus");
        fetchUsers();
      } else {
        toast.error(res.error || "Gagal menghapus pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus pengguna");
    }
  };

  // Stats calculation
  const total = users.length;
  const activeAdmins = users.filter((u) => u.role === "ADMIN" && u.status === "ACTIVE").length;
  const activeCashiers = users.filter((u) => u.role === "KASIR" && u.status === "ACTIVE").length;
  const inactive = users.filter((u) => u.status === "INACTIVE").length;

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">User Account</h1>
        <p className="text-sm text-text-tertiary">Kelola akun pengguna dan hak akses kasir / admin toko</p>
      </div>

      <UserStats
        total={total}
        activeAdmins={activeAdmins}
        activeCashiers={activeCashiers}
        inactive={inactive}
      />

      <UserFilter
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddClick={handleOpenAdd}
      />

      <UserTable
        users={users}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
        isLoading={isLoading}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        editingUser={editingUser}
        isLoading={isPending}
      />
    </div>
  );
}
