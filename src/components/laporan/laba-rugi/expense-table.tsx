"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { deleteExpense } from "@/server/actions/expense";
import { Trash1 } from "@tailgrids/icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface ExpenseTableProps {
  expenses: any[];
  totalExpense: number;
  onRefresh: () => void;
}

export function ExpenseTable({ expenses, totalExpense, onRefresh }: ExpenseTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengeluaran "${title}"?`)) return;

    try {
      const res = await deleteExpense(id);
      if (res.success) {
        toast.success(res.message);
        onRefresh();
      } else {
        toast.error(res.error || "Gagal menghapus pengeluaran.");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan server.");
    }
  };

  return (
    <Card className="overflow-hidden p-0 shadow-xs border border-card-border bg-card-surface-area">
      <div className="flex items-center justify-between border-b border-card-border p-4 bg-card-surface-area">
        <div>
          <h3 className="text-base font-bold text-text-primary">Rincian Pengeluaran Operasional Toko</h3>
          <p className="text-xs text-text-tertiary">Daftar biaya operasional yang memotong Laba Kotor</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-tertiary block">Total Pengeluaran</span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-card-surface-area text-xs uppercase font-semibold text-text-tertiary">
            <tr>
              <th className="px-5 py-3">Nama Pengeluaran</th>
              <th className="px-5 py-3">Tanggal</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Pencatat</th>
              <th className="px-5 py-3 text-right">Nominal (Rp)</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border bg-card-surface-area">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-text-tertiary">
                  Belum ada catatan pengeluaran operasional pada periode ini.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="transition-colors hover:bg-background-gray-secondary/40">
                  <td className="px-5 py-3 font-semibold text-text-primary">
                    {exp.title}
                    {exp.note && <span className="block text-xs font-normal text-text-tertiary">{exp.note}</span>}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-text-tertiary">
                    {format(new Date(exp.date), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color="warning">{exp.category || "Operasional"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs font-medium text-text-primary">
                    {exp.createdBy?.name || "Admin"}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Button
                      size="sm"
                      appearance="outline"
                      iconOnly
                      onClick={() => handleDelete(exp.id, exp.title)}
                      aria-label="Hapus Pengeluaran"
                      className="size-7 rounded-lg text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash1 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
