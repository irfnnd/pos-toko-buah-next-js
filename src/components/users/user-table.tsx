"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { User } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PenToSquare, Trash1, Reload, UserCircle1, Shield1Check } from "@tailgrids/icons";
import { useState } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";

type SafeUser = Omit<User, "password">;

interface UserTableProps {
  users: SafeUser[];
  onEdit: (user: SafeUser) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

export function UserTable({ users, onEdit, onToggleStatus, onDelete, isLoading }: UserTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<SafeUser | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card-surface-area py-12 text-center">
        <UserCircle1 className="mb-3 size-10 text-text-tertiary" />
        <h3 className="text-base font-semibold text-text-primary">Tidak Ada Pengguna</h3>
        <p className="text-sm text-text-tertiary">Belum ada data pengguna yang sesuai dengan kriteria filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-gray-50/50 text-xs font-semibold text-text-tertiary uppercase dark:bg-gray-900/50">
            <tr>
              <th className="px-5 py-3.5">Nama & Username</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Dibuat Pada</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-950/60 dark:text-primary-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-tertiary">@{user.username}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {user.role === "ADMIN" ? (
                    <Badge color="purple" size="sm" prefixIcon={<Shield1Check className="size-3" />}>
                      Admin
                    </Badge>
                  ) : (
                    <Badge color="blue" size="sm" prefixIcon={<UserCircle1 className="size-3" />}>
                      Kasir
                    </Badge>
                  )}
                </td>

                <td className="px-5 py-4">
                  {user.status === "ACTIVE" ? (
                    <Badge color="success" size="sm">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge color="gray" size="sm">
                      Nonaktif
                    </Badge>
                  )}
                </td>

                <td className="px-5 py-4 text-xs text-text-tertiary">
                  {format(new Date(user.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                </td>

                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(user.id)}
                      aria-label={user.status === "ACTIVE" ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                      className="p-1.5 text-text-tertiary hover:text-text-primary"
                    >
                      <Reload className={`size-4 ${user.status === "ACTIVE" ? "text-emerald-600" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      aria-label="Edit Pengguna"
                      className="p-1.5 text-text-tertiary hover:text-blue-600"
                    >
                      <PenToSquare className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(user)}
                      aria-label="Hapus Pengguna"
                      className="p-1.5 text-text-tertiary hover:text-red-600"
                    >
                      <Trash1 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Apakah Anda yakin ingin menghapus akun pengguna <strong>{deleteTarget?.name}</strong> (@{deleteTarget?.username})? Actions ini tidak dapat dibatalkan.
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" appearance="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus Pengguna
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
