"use client";
import { useEffect, useState } from "react";
import { useAsk, useCart } from "@/components/ui-shell-providers";

const EVENT = "qante-cart-toast";
const HIDE_MS = 3400;
const UNDO_HIDE_MS = 5600;

export type CartToastDetail = {
  text?: string;
  /** Default open = "Sepeti aç". undo = restore removed line. */
  action?: "open" | "undo";
  productId?: string;
  qty?: number;
};

export function flashCartToast(textOrDetail: string | CartToastDetail = "Sepete eklendi") {
  try {
    const detail: CartToastDetail =
      typeof textOrDetail === "string" ? { text: textOrDetail, action: "open" } : textOrDetail;
    window.dispatchEvent(new CustomEvent(EVENT, { detail }));
  } catch {
    /* ignore */
  }
}

type ToastState = {
  text: string;
  action: "open" | "undo";
  productId?: string;
  qty: number;
  n: number;
};

/** Lightweight cart feedback — Sepeti aç, or Geri al after remove. */
export function CartToastHost() {
  const { cartOpen, setCartOpen } = useAsk();
  const { add } = useCart();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<CartToastDetail>).detail || {};
      const text = (d.text || "Sepete eklendi").trim() || "Sepete eklendi";
      const action = d.action === "undo" && d.productId ? "undo" : "open";
      setToast({
        text,
        action,
        productId: d.productId,
        qty: Math.max(1, d.qty ?? 1),
        n: Date.now(),
      });
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  useEffect(() => {
    // Hide add-to-cart toast when drawer opens; keep undo visible inside drawer/sepet.
    if (cartOpen && toast?.action !== "undo") setToast(null);
  }, [cartOpen, toast?.action]);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.action === "undo" ? UNDO_HIDE_MS : HIDE_MS;
    const t = window.setTimeout(() => setToast(null), ms);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  if (cartOpen && toast.action !== "undo") return null;

  return (
    <div
      className="cart-toast"
      data-cta={toast.action === "undo" ? "cart-toast-undo" : "cart-toast"}
      role="status"
      aria-live="polite"
    >
      <span className="cart-toast-text">{toast.text}</span>
      {toast.action === "undo" && toast.productId ? (
        <button
          className="chip on"
          type="button"
          data-cta="cart-undo"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await add(toast.productId!, toast.qty);
              setToast(null);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "…" : "Geri al"}
        </button>
      ) : (
        <button
          className="chip on"
          type="button"
          data-cta="cart-toast-open"
          onClick={() => {
            setCartOpen(true);
            setToast(null);
          }}
        >
          Sepeti aç
        </button>
      )}
      <button
        className="icon-btn"
        type="button"
        aria-label="Kapat"
        data-cta="cart-toast-dismiss"
        onClick={() => setToast(null)}
        style={{ padding: "6px 10px" }}
      >
        ×
      </button>
    </div>
  );
}
