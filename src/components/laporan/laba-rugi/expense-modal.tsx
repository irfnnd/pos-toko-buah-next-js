"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { createExpense } from "@/server/actions/expense";
import { Plus } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("Listrik & Air");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul pengeluaran wajib diisi.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Nominal pengeluaran harus lebih besar dari 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
        note: note.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        setTitle("");
        setAmount("");
        setNote("");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Gagal mencatat pengeluaran.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-md!">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary-600" />
            Tambah Biaya / Pengeluaran Operasional
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-3.5 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-text-primary">
              Judul / Nama Pengeluaran <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bayar Listrik Bulan September, Pembelian Kantong Plastik..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-background px-3 py-2 text-xs text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-text-primary">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-card-border bg-card-background px-3 py-2 text-xs font-bold text-text-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-text-primary">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-background px-2.5 py-2 text-xs font-medium text-text-secondary focus:border-primary-500 focus:outline-none"
              >
                <option value="Listrik & Air">Listrik & Air</option>
                <option value="Gaji Karyawan">Gaji Karyawan</option>
                <option value="Sewa Tempat">Sewa Tempat</option>
                <option value="Kemasan & Plastik">Kemasan & Plastik</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Lainnya">Operasional Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-text-primary">
              Tanggal Pengeluaran
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-background px-3 py-2 text-xs text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-text-primary">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card-background px-3 py-2 text-xs text-text-primary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </DialogBody>

        <DialogFooter className="pt-3 border-t border-card-border">
          <Button type="button" appearance="outline" onClick={onClose} isDisabled={isSubmitting} size="sm">
            Batal
          </Button>
          <Button type="submit" isDisabled={isSubmitting} size="sm" className="font-semibold">
            {isSubmitting ? "Memproses..." : "Simpan Pengeluaran"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
