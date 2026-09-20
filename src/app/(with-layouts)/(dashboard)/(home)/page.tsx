import PosOverviewStats from "./_component/pos-overview-stats";
import PosRecentTransactions from "./_component/pos-recent-transactions";
import PosSalesChart from "./_component/pos-sales-chart";
import PosTopProducts from "./_component/pos-top-products";
import { getDashboardSummaryAction } from "@/server/actions/dashboard";

export default async function Home() {
  const summary = await getDashboardSummaryAction();

  return (
    <div className="mt-6 space-y-6 px-2 lg:px-6 mb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Dashboard POS Toko Buah
        </h1>
        <p className="text-sm text-text-tertiary">
          Ringkasan penjualan real-time, stok aktif, notifikasi masa simpan, dan performa produk.
        </p>
      </div>

      {/* 1. Overview Metric Cards */}
      <PosOverviewStats metrics={summary.metrics} />

      {/* 2. 7-Day Sales & Profit Chart */}
      <PosSalesChart salesTrend7Days={summary.salesTrend7Days} />

      {/* 3. Grid: Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PosTopProducts topProducts={summary.topProducts} />
        </div>
        <div className="lg:col-span-7">
          <PosRecentTransactions lastTransactions={summary.lastTransactions} />
        </div>
      </div>
    </div>
  );
}
