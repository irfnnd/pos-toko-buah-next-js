import { NextResponse } from "next/server";
import { checkAndDispatchStockAlertPush } from "@/lib/push";

/**
 * Background Stock Alert Checker
 * Can be triggered periodically via server cron / webhook / scheduler
 * Example: curl http://localhost:3000/api/cron/check-stock
 */
export async function GET() {
  try {
    const result = await checkAndDispatchStockAlertPush();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cron check-stock error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

