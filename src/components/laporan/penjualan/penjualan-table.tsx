"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { PaymentMethod, SaleStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PenjualanTableProps {
  sales: any[];
  isLoading?: boolean;
}

export function PenjualanTable({ sales, isLoading = false }: PenjualanTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Badge color="success">Tunai</Badge>;
      case PaymentMethod.QRIS:
        return <Badge color="blue">QRIS</Badge>;
      case PaymentMethod.TRANSFER:
        return <Badge color="purple">Transfer</Badge>;
      default:
        return <Badge color="gray">Lainnya</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden p-0 shadow-xs">
      <div className="border-b border-card-border p-4 bg-card-surface-area">
        <h3 className="text-base font-bold text-text-primary">Detail Rincian Laporan Penjualan</h3>
        <p className="text-xs text-text-tertiary">Daftar transaksi penjualan selesai dalam periode laporan</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-card-surface-area text-xs uppercase font-semibold text-text-tertiary">
            <tr>
              <th className="px-5 py-3.5">No. Invoice</th>
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-5 py-3.5">Kasir</th>
              <th className="px-5 py-3.5 text-center">Jumlah Item</th>
              <th className="px-5 py-3.5 text-right">Total Penjualan (Omset)</th>
              <th className="px-5 py-3.5 text-right">Total HPP (Modal)</th>
              <th className="px-5 py-3.5 text-right">Laba Kotor</th>
              <th className="px-5 py-3.5 text-center">Metode Bayar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border bg-card-surface-area">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-text-tertiary">
                  Memuat data laporan penjualan...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-text-tertiary">
                  Tidak ada transaksi penjualan pada periode ini.
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const totalCost = sale.items?.reduce(
                  (acc: number, item: any) => acc + (item.costTotal || 0),
                  0
                ) || 0;
                const totalProfit = sale.items?.reduce(
                  (acc: number, item: any) => acc + (item.profit || 0),
                  0
                ) || 0;

                return (
                  <tr
                    key={sale.id}
                    className="transition-colors hover:bg-background-gray-secondary/40"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-text-primary">
                      {sale.invoiceNo}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-text-tertiary">
                      {format(new Date(sale.saleDate), "dd MMM yyyy, HH:mm", {
                        locale: id,
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-text-primary">
                      {sale.cashier?.name || "Kasir"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium">
                      {sale.items?.length || 0} item
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-text-primary">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-text-tertiary">
                      {formatCurrency(totalCost)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalProfit)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {getPaymentBadge(sale.paymentMethod)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
