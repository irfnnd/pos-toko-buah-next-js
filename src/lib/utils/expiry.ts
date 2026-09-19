import { ExpiryStatus } from "@prisma/client";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

export const DEFAULT_WARNING_DAYS = 3;

/**
 * Calculates expiry date based on receive date and shelf life days.
 * expiryDate = receiveDate + shelfLifeDays
 */
export function calculateExpiryDate(receiveDate: Date, shelfLifeDays: number): Date {
  return addDays(new Date(receiveDate), shelfLifeDays);
}

/**
 * Determines ExpiryStatus based on expiry date, current quantity, and warning window.
 */
export function getExpiryStatus(
  expiryDate: Date,
  currentQuantity: number,
  warningDays: number = DEFAULT_WARNING_DAYS
): ExpiryStatus {
  if (currentQuantity <= 0) {
    return ExpiryStatus.HABIS;
  }

  const today = startOfDay(new Date());
  const exp = startOfDay(new Date(expiryDate));

  const diffDays = differenceInCalendarDays(exp, today);

  if (diffDays < 0) {
    return ExpiryStatus.MELEWATI_BATAS;
  }

  if (diffDays <= warningDays) {
    return ExpiryStatus.SEGERA_BATAS;
  }

  return ExpiryStatus.AMAN;
}

/**
 * Calculates remaining days until expiry.
 * Returns negative if already expired.
 */
export function getRemainingDays(expiryDate: Date): number {
  const today = startOfDay(new Date());
  const exp = startOfDay(new Date(expiryDate));
  return differenceInCalendarDays(exp, today);
}
