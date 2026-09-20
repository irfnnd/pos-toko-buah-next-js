import assert from "node:assert";
import { test, describe } from "node:test";
import { ExpiryStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import {
  calculateExpiryDate,
  getExpiryStatus,
  getRemainingDays,
} from "../src/lib/utils/expiry";

describe("Expiry Status Business Logic Tests", () => {
  test("calculateExpiryDate correctly adds shelfLifeDays to receiveDate", () => {
    const receiveDate = new Date("2026-09-01T00:00:00.000Z");
    const shelfLifeDays = 14;
    const expiryDate = calculateExpiryDate(receiveDate, shelfLifeDays);

    const expectedDate = new Date("2026-09-15T00:00:00.000Z");
    assert.strictEqual(expiryDate.toISOString(), expectedDate.toISOString());
  });

  test("getExpiryStatus returns HABIS when currentQuantity is 0 or negative", () => {
    const futureDate = addDays(new Date(), 10);
    assert.strictEqual(getExpiryStatus(futureDate, 0), ExpiryStatus.HABIS);
    assert.strictEqual(getExpiryStatus(futureDate, -5), ExpiryStatus.HABIS);
  });

  test("getExpiryStatus returns MELEWATI_BATAS when expiryDate is in the past", () => {
    const pastDate = subDays(new Date(), 2);
    assert.strictEqual(getExpiryStatus(pastDate, 10), ExpiryStatus.MELEWATI_BATAS);
  });

  test("getExpiryStatus returns SEGERA_BATAS when expiryDate is within warningDays", () => {
    const nearDate = addDays(new Date(), 2); // 2 days left <= 3 warning days
    assert.strictEqual(getExpiryStatus(nearDate, 10, 3), ExpiryStatus.SEGERA_BATAS);
  });

  test("getExpiryStatus returns AMAN when expiryDate is beyond warningDays", () => {
    const safeDate = addDays(new Date(), 10); // 10 days left > 3 warning days
    assert.strictEqual(getExpiryStatus(safeDate, 10, 3), ExpiryStatus.AMAN);
  });

  test("getRemainingDays calculates correct remaining days", () => {
    const futureDate = addDays(new Date(), 5);
    const pastDate = subDays(new Date(), 3);

    assert.strictEqual(getRemainingDays(futureDate), 5);
    assert.strictEqual(getRemainingDays(pastDate), -3);
  });
});
