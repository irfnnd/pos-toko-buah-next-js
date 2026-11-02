"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { SaleStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface PosRecentTransactionsProps {
  lastTransactions: any[];
}

export default function PosRecentTransactions({
  lastTransactions,
}: PosRecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <Card className="p-5 space-y-4 shadow-xs border border-card-border bg-card-surface-area">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">Aktivitas Transaksi Terkini</h3>
          <p className="text-xs text-text-tertiary">5 transaksi terbaru di toko buah</p>
        </div>
        <Link href="/transaksi" className="text-xs font-semibold text-primary-600 hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-card-border bg-gray-50 dark:bg-gray-800/60 font-semibold text-text-tertiary uppercase">
            <tr>
              <th className="px-3 py-2">Invoice</th>
              <th className="px-3 py-2">Waktu</th>
              <th className="px-3 py-2">Kasir</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {lastTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-text-tertiary">
                  Belum ada transaksi recorded.
                </td>
              </tr>
            ) : (
              lastTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                  <td className="px-3 py-2.5 font-mono font-bold text-text-primary">
                    {t.invoiceNo}
                  </td>
                  <td className="px-3 py-2.5 text-text-tertiary whitespace-nowrap">
                    {format(new Date(t.saleDate), "dd MMM, HH:mm", { locale: id })}
                  </td>
                  <td className="px-3 py-2.5 text-text-primary">
                    {t.cashier?.name || "Kasir"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-text-primary">
                    {formatCurrency(t.totalAmount)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {t.status === SaleStatus.COMPLETED ? (
                      <Badge color="success">Selesai</Badge>
                    ) : (
                      <Badge color="error">Batal</Badge>
                    )}
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
