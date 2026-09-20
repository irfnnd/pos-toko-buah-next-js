"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Eye, Printer, XmarkCircle } from "@tailgrids/icons";
import { PaymentMethod, SaleStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TransaksiTableProps {
  sales: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (sale: any) => void;
  onPrintReceipt: (sale: any) => void;
  onCancelSale: (sale: any) => void;
  isLoading?: boolean;
}

export function TransaksiTable({
  sales,
  pagination,
  onPageChange,
  onViewDetail,
  onPrintReceipt,
  onCancelSale,
  isLoading = false,
}: TransaksiTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getStatusBadge = (status: SaleStatus) => {
    if (status === SaleStatus.COMPLETED) {
      return <Badge color="success">Selesai</Badge>;
    }
    return <Badge color="error">Dibatalkan</Badge>;
  };

  return (
    <Card className="overflow-hidden p-0 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="border-b border-card-border bg-card-surface-area text-xs uppercase font-semibold text-text-tertiary">
            <tr>
              <th className="px-5 py-3.5">No. Invoice</th>
              <th className="px-5 py-3.5">Tanggal & Waktu</th>
              <th className="px-5 py-3.5">Kasir</th>
              <th className="px-5 py-3.5 text-center">Jumlah Item</th>
              <th className="px-5 py-3.5 text-right">Total Penjualan</th>
              <th className="px-5 py-3.5 text-right">Estimasi Laba</th>
              <th className="px-5 py-3.5 text-center">Metode Bayar</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border bg-card-surface-area">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-text-tertiary">
                  Memuat data transaksi...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-text-tertiary">
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const totalProfit = sale.items?.reduce(
                  (acc: number, item: any) => acc + (item.profit || 0),
                  0
                ) || 0;

                const isCancelled = sale.status === SaleStatus.CANCELLED;

                return (
                  <tr
                    key={sale.id}
                    className="transition-colors hover:bg-background-gray-secondary/40"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-text-primary">
                      {sale.invoiceNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-text-tertiary">
                      {format(new Date(sale.saleDate), "dd MMM yyyy, HH:mm", {
                        locale: id,
                      })}
                    </td>
                    <td className="px-5 py-4 font-medium text-text-primary">
                      {sale.cashier?.name || "Kasir"}
                    </td>
                    <td className="px-5 py-4 text-center font-medium">
                      {sale._count?.items || sale.items?.length || 0} item
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-text-primary">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className={`px-5 py-4 text-right font-medium ${isCancelled ? 'text-text-tertiary line-through' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(totalProfit)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getPaymentBadge(sale.paymentMethod)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          appearance="outline"
                          iconOnly
                          onClick={() => onViewDetail(sale)}
                          aria-label="Lihat Detail Transaksi"
                          className="size-8 rounded-lg text-text-secondary hover:text-text-primary"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          appearance="outline"
                          iconOnly
                          onClick={() => onPrintReceipt(sale)}
                          aria-label="Cetak Struk"
                          className="size-8 rounded-lg text-text-secondary hover:text-text-primary"
                        >
                          <Printer className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          appearance="outline"
                          iconOnly
                          isDisabled={isCancelled}
                          onClick={() => onCancelSale(sale)}
                          aria-label="Batalkan Transaksi"
                          className={`size-8 rounded-lg ${
                            isCancelled
                              ? "opacity-30 cursor-not-allowed"
                              : "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
                          }`}
                        >
                          <XmarkCircle className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-card-border px-5 py-3.5 text-xs text-text-tertiary">
          <div>
            Menampilkan <span className="font-semibold text-text-primary">{sales.length}</span> dari{" "}
            <span className="font-semibold text-text-primary">{pagination.totalCount}</span> transaksi
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              appearance="outline"
              isDisabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="text-xs px-2.5 py-1"
            >
              Sebelumnya
            </Button>
            <span className="px-2 font-medium text-text-primary">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              size="sm"
              appearance="outline"
              isDisabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="text-xs px-2.5 py-1"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
