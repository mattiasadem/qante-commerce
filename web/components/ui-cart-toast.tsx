"use client";
import { useEffect, useState } from "react";
import { useAsk } from "@/components/ui-shell-providers";

const EVENT = "qante-cart-toast";
const HIDE_MS = 3400;

export function flashCartToast(text = "Sepete eklendi") {
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { text } }));
  } catch {
    /* ignore */
  }
}

/** Lightweight add-to-cart feedback — Sepeti aç without forcing the drawer. */
export function CartToastHost() {
  const { cartOpen, setCartOpen } = useAsk();
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ text?: string }>).detail;
      const text = (d?.text || "Sepete eklendi").trim() || "Sepete eklendi";
      setToast({ text, n: Date.now() });
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  useEffect(() => {
    if (cartOpen) setToast(null);
  }, [cartOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), HIDE_MS);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!toast || cartOpen) return null;

  return (
    <div
      className="cart-toast"
      data-cta="cart-toast"
      role="status"
      aria-live="polite"
    >
      <span className="cart-toast-text">{toast.text}</span>
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
