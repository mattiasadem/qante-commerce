"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/core";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell-providers";

export type CompareSnap = {
  id: string;
  name: string;
  price: number;
  compare_at: number | null;
  stock: number;
  category: string;
  image: string;
  sku: string;
  sizes?: string[];
  colors?: string[];
};

const KEY = "qante_compare";
export const COMPARE_MAX = 3;

export function toSnap(p: Product): CompareSnap {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    compare_at: p.compare_at ?? null,
    stock: p.stock,
    category: p.category,
    image: p.image,
    sku: p.sku,
    sizes: p.sizes,
    colors: p.colors?.map((c) => c.name),
  };
}

export function readCompare(): CompareSnap[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x): x is CompareSnap => !!x && typeof x === "object" && typeof (x as CompareSnap).id === "string")
      .slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
}

export function writeCompare(items: CompareSnap[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, COMPARE_MAX)));
    window.dispatchEvent(new CustomEvent("qante-compare"));
  } catch {
    /* ignore */
  }
}

export function useCompare() {
  const [items, setItems] = useState<CompareSnap[]>([]);
  useEffect(() => {
    const sync = () => setItems(readCompare());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-compare", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-compare", sync);
    };
  }, []);
  const has = useCallback((id: string) => items.some((x) => x.id === id), [items]);
  const toggle = useCallback((snap: CompareSnap) => {
    const prev = readCompare();
    const exists = prev.some((x) => x.id === snap.id);
    let next: CompareSnap[];
    if (exists) next = prev.filter((x) => x.id !== snap.id);
    else if (prev.length >= COMPARE_MAX) next = [...prev.slice(1), snap];
    else next = [...prev, snap];
    writeCompare(next);
    setItems(next);
  }, []);
  const remove = useCallback((id: string) => {
    const next = readCompare().filter((x) => x.id !== id);
    writeCompare(next);
    setItems(next);
  }, []);
  const clear = useCallback(() => {
    writeCompare([]);
    setItems([]);
  }, []);
  return { items, has, toggle, remove, clear };
}

export function CompareButton({
  product,
  className = "btn",
  compact,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const { has, toggle, items } = useCompare();
  const on = has(product.id);
  const full = !on && items.length >= COMPARE_MAX;
  return (
    <button
      className={className}
      type="button"
      aria-pressed={on}
      data-cta="compare-toggle"
      title={full ? `En fazla ${COMPARE_MAX} ürün` : on ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(toSnap(product));
      }}
    >
      {compact ? (on ? "⇄✓" : "⇄") : on ? "Karşılaştırmada" : full ? "Liste dolu" : "Karşılaştır"}
    </button>
  );
}

export function CompareTray() {
  const { items, remove, clear } = useCompare();
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  if (!items.length) return null;

  async function addAll() {
    setBusy(true);
    try {
      for (const p of items) {
        if (p.stock > 0) await add(p.id, 1);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="compare-tray"
      data-cta="compare-tray"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 72,
        zIndex: 40,
        maxWidth: 920,
        margin: "0 auto",
        background: "rgba(250,247,242,0.97)",
        border: "1px solid rgba(11,11,11,0.12)",
        borderRadius: 14,
        boxShadow: "0 10px 40px rgba(11,11,11,0.12)",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{ fontSize: 13 }}>Karşılaştır · {items.length}/{COMPARE_MAX}</strong>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {items.map((p) => (
            <span key={p.id} className="chip on" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Link href={`/urun/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                {p.name}
              </Link>
              <button type="button" aria-label="Çıkar" data-cta="compare-remove" onClick={() => remove(p.id)} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0 }}>
                ×
              </button>
            </span>
          ))}
        </div>
        <button className="chip" type="button" data-cta="compare-open" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "Tabloyu gizle" : "Tabloyu aç"}
        </button>
        <button className="chip on" type="button" data-cta="compare-add-all" disabled={busy || !items.some((p) => p.stock > 0)} onClick={() => void addAll()}>
          {busy ? "…" : "Hepsini sepete"}
        </button>
        <button className="chip" type="button" data-cta="compare-clear" onClick={clear}>
          Temizle
        </button>
      </div>
      {open ? (
        <div style={{ overflowX: "auto", marginTop: 10 }} data-cta="compare-table">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.1)" }}>Özellik</th>
                {items.map((p) => (
                  <th key={p.id} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.1)" }}>
                    <Link href={`/urun/${p.id}`}>{p.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Fiyat", (p: CompareSnap) => money(p.price)],
                  ["Liste", (p: CompareSnap) => (p.compare_at ? money(p.compare_at) : "\u2014")],
                  ["Stok", (p: CompareSnap) => (p.stock > 0 ? `${p.stock} adet` : "tükendi")],
                  ["Kategori", (p: CompareSnap) => p.category],
                  ["SKU", (p: CompareSnap) => p.sku],
                  ["Beden", (p: CompareSnap) => (p.sizes?.length ? p.sizes.join(", ") : "\u2014")],
                  ["Renk", (p: CompareSnap) => (p.colors?.length ? p.colors.join(", ") : "\u2014")],
                ] as [string, (p: CompareSnap) => string][]
              ).map(([label, fn]) => (
                <tr key={label}>
                  <td className="faint" style={{ padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.06)" }}>
                    {label}
                  </td>
                  {items.map((p) => (
                    <td key={p.id} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.06)" }}>
                      {fn(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="faint" style={{ padding: "8px" }}>
                  Sepet
                </td>
                {items.map((p) => (
                  <td key={p.id} style={{ padding: "8px" }}>
                    <button
                      className="btn btn-primary quick"
                      type="button"
                      disabled={p.stock <= 0}
                      data-cta="compare-add-one"
                      onClick={() => void add(p.id, 1)}
                    >
                      {p.stock <= 0 ? "Tükendi" : "Ekle"}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
