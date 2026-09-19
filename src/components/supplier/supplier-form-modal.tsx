"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Supplier } from "@prisma/client";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    code: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    note?: string | null;
    status: "ACTIVE" | "INACTIVE";
  }) => Promise<void>;
  editingSupplier?: Supplier | null;
  isLoading?: boolean;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSupplier,
  isLoading = false,
}: SupplierFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingSupplier) {
      setCode(editingSupplier.code);
      setName(editingSupplier.name);
      setPhone(editingSupplier.phone || "");
      setAddress(editingSupplier.address || "");
      setNote(editingSupplier.note || "");
      setStatus(editingSupplier.status);
    } else {
      setCode("");
      setName("");
      setPhone("");
      setAddress("");
      setNote("");
      setStatus("ACTIVE");
    }
    setErrorMsg(null);
  }, [editingSupplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim()) {
      setErrorMsg("Kode supplier wajib diisi");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Nama supplier wajib diisi");
      return;
    }

    try {
      await onSubmit({
        id: editingSupplier?.id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        note: note.trim() || null,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat menyimpan supplier");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>{editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Kode Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SUP-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary uppercase focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Nama Supplier / Distributor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: CV Buah Segar Nusantara"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Status Supplier <span className="text-red-500">*</span>
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

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Alamat</label>
            <textarea
              rows={2}
              placeholder="Alamat kantor atau gudang supplier..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Spesialisasi buah, syarat pembayaran, dll..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-surface-area px-3.5 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="mt-4">
          <Button type="button" variant="primary" appearance="outline" onClick={onClose} isDisabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" isDisabled={isLoading}>
            {isLoading ? "Menyimpan..." : editingSupplier ? "Simpan Perubahan" : "Tambah Supplier"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
