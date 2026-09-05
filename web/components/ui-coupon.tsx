"use client";
import { useCallback, useEffect, useState } from "react";
import { money, SHIP_FREE } from "@/lib/core";

const COUPON_KEY = "qante_coupon";

export type CouponKind = "percent" | "fixed" | "ship";
export type AppliedCoupon = {
  code: string;
  kind: CouponKind;
  value: number;
  label: string;
};

const COUPONS: Record<string, AppliedCoupon> = {
  QANTE10: { code: "QANTE10", kind: "percent", value: 10, label: "%10 indirim" },
  HOSGELDIN: { code: "HOSGELDIN", kind: "fixed", value: 100, label: "100 ₺ indirim" },
  KARGO: { code: "KARGO", kind: "ship", value: 0, label: "Ücretsiz kargo" },
};

export function readCoupon(): AppliedCoupon | null {
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    if (!raw) return null;
    const code = raw.trim().toUpperCase();
    return COUPONS[code] ?? null;
  } catch {
    return null;
  }
}

export function writeCoupon(code: string | null) {
  try {
    if (!code) localStorage.removeItem(COUPON_KEY);
    else localStorage.setItem(COUPON_KEY, code.toUpperCase());
    window.dispatchEvent(new CustomEvent("qante-coupon"));
  } catch {
    /* ignore */
  }
}

export function clearCoupon() {
  writeCoupon(null);
}

export function calcDiscount(subtotal: number, coupon: AppliedCoupon | null): number {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.kind === "percent") return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  if (coupon.kind === "fixed") return Math.min(subtotal, coupon.value);
  return 0;
}

export function payableTotal(subtotal: number, coupon: AppliedCoupon | null): number {
  return Math.max(0, Math.round((subtotal - calcDiscount(subtotal, coupon)) * 100) / 100);
}

export function isFreeShip(subtotal: number, coupon: AppliedCoupon | null): boolean {
  if (coupon?.kind === "ship") return true;
  return subtotal >= SHIP_FREE;
}

export function useCoupon() {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  useEffect(() => {
    const sync = () => setCoupon(readCoupon());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-coupon", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-coupon", sync);
    };
  }, []);
  const clear = useCallback(() => {
    clearCoupon();
    setCoupon(null);
  }, []);
  return { coupon, clear };
}

/** Cart coupon field — demo codes only, localStorage, no ikas. */
export function CouponField() {
  const { coupon, clear } = useCoupon();
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function apply() {
    const code = input.trim().toUpperCase();
    if (!code) return;
    if (!COUPONS[code]) {
      setErr("Geçersiz kupon · dene: QANTE10, HOSGELDIN, KARGO");
      return;
    }
    writeCoupon(code);
    setInput("");
    setErr(null);
  }

  if (coupon) {
    return (
      <div style={{ marginBottom: 12 }} data-cta="coupon-applied">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <span className="chip on" aria-label="Uygulanan kupon">
            {coupon.code} · {coupon.label}
          </span>
          <button className="chip" type="button" data-cta="coupon-clear" onClick={() => clear()}>
            Kaldır
          </button>
        </div>
        <p className="faint" style={{ marginTop: 6 }}>
          Demo kupon · checkout tutarına yansır · ikas&apos;a gitmez
        </p>
      </div>
    );
  }

  return (
    <label style={{ display: "block", marginBottom: 12 }} data-cta="coupon-field">
      <span className="faint" style={{ display: "block", marginBottom: 6 }}>
        Kupon kodu
      </span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="search"
          value={input}
          placeholder="QANTE10"
          aria-label="Kupon kodu"
          data-cta="coupon-input"
          onChange={(e) => {
            setInput(e.target.value);
            setErr(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          style={{ flex: 1, minWidth: 120 }}
        />
        <button className="btn" type="button" data-cta="coupon-apply" onClick={apply}>
          Uygula
        </button>
      </div>
      {err ? (
        <p className="muted" style={{ marginTop: 6 }}>
          <span className="banner-demo">{err}</span>
        </p>
      ) : null}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
        role="group"
        aria-label="Hazır kuponlar"
        data-cta="coupon-quick"
      >
        {Object.values(COUPONS).map((c) => (
          <button
            key={c.code}
            className="chip"
            type="button"
            data-cta={`coupon-chip-${c.code.toLowerCase()}`}
            title={c.label}
            onClick={() => {
              writeCoupon(c.code);
              setInput("");
              setErr(null);
            }}
          >
            {c.code}
            <span className="faint" style={{ marginLeft: 4 }}>
              {c.label}
            </span>
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        Tıkla ya da yaz · demo kupon · ikas&apos;a gitmez
      </p>
    </label>
  );
}

/** Discount + payable lines under ara toplam. */
export function CouponTotals({ subtotal }: { subtotal: number }) {
  const { coupon } = useCoupon();
  const discount = calcDiscount(subtotal, coupon);
  if (!coupon || (discount <= 0 && coupon.kind !== "ship")) return null;
  const pay = payableTotal(subtotal, coupon);
  return (
    <div style={{ marginBottom: 12 }} data-cta="coupon-totals">
      {discount > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="muted">İndirim · {coupon.code}</span>
          <strong>−{money(discount)}</strong>
        </div>
      ) : null}
      {coupon.kind === "ship" ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="muted">Kargo</span>
          <strong>ücretsiz · {coupon.code}</strong>
        </div>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="muted">Ödenecek</span>
        <strong>{money(pay)}</strong>
      </div>
    </div>
  );
}

export { COUPON_KEY, COUPONS };
