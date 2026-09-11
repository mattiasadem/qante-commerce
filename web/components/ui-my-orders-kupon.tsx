"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** Siparişlerim row: coupon preference from checkout note. */
export function MyOrderKuponLine({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  if (!coupon) return null;
  return (
    <div className="faint" data-cta="my-orders-kupon">
      Kupon · {coupon.label}
    </div>
  );
}
