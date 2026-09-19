"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { User } from "@prisma/client";

type SafeUser = Omit<User, "password">;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    username: string;
    password?: string;
    role: "ADMIN" | "KASIR";
    status: "ACTIVE" | "INACTIVE";
  }) => Promise<void>;
  editingUser?: SafeUser | null;
  isLoading?: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  isLoading = false,
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "KASIR">("KASIR");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setUsername(editingUser.username);
      setPassword("");
      setRole(editingUser.role);
      setStatus(editingUser.status);
    } else {
      setName("");
      setUsername("");
      setPassword("");
      setRole("KASIR");
      setStatus("ACTIVE");
    }
    setErrorMsg(null);
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama lengkap wajib diisi");
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg("Username minimal 3 karakter");
      return;
    }
    if (!editingUser && (!password || password.length < 6)) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    try {
      await onSubmit({
        id: editingUser?.id,
        name: name.trim(),
        username: username.trim(),
        password: password ? password : undefined,
        role,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat menyimpan pengguna");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ahmad Kasir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: ahmad_kasir"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Password {editingUser ? "(Kosongkan jika tidak diubah)" : <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              placeholder={editingUser ? "••••••••" : "Minimal 6 karakter"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Role Pengguna <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "KASIR")}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="KASIR">Kasir</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Status Akun <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
