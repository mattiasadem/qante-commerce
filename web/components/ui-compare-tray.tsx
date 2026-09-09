"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell-providers";
import {
  COMPARE_MAX,
  compareQstr,
  parseCompareParam,
  readCompare,
  snapsFromIds,
  useCompare,
  writeCompare,
  type CompareSnap,
} from "@/components/ui-compare-model";

export function CompareTray() {
  const { items, remove, clear } = useCompare();
  const { add } = useCart();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);
  const forceClearUrl = useRef(false);
  const prevItemCount = useRef(0);

  const urlIds = useMemo(() => parseCompareParam(searchParams.get("compare")), [searchParams]);
  const itemIds = useMemo(() => items.map((x) => x.id), [items]);
  const itemKey = itemIds.join(",");
  const urlKey = urlIds.join(",");

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (!urlIds.length) return;
    const snaps = snapsFromIds(urlIds);
    if (!snaps.length) return;
    if (readCompare().map((x) => x.id).join(",") === snaps.map((x) => x.id).join(",")) return;
    writeCompare(snaps);
  }, [urlIds]);

  useEffect(() => {
    const hadItems = prevItemCount.current > 0;
    prevItemCount.current = itemIds.length;
    if (itemKey === urlKey) {
      forceClearUrl.current = false;
      return;
    }
    if (!itemIds.length && urlIds.length && !hadItems && !forceClearUrl.current) return;
    forceClearUrl.current = false;
    const sp = new URLSearchParams(searchParams.toString());
    if (itemIds.length) sp.set("compare", itemIds.join(","));
    else sp.delete("compare");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [itemKey, urlKey, itemIds, urlIds, pathname, router, searchParams]);

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

  async function copyLink() {
    const qs = compareQstr(itemIds);
    const path = qs ? `/?${qs}` : "/";
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const rows: [string, (p: CompareSnap) => string][] = [
    ["Fiyat", (p) => money(p.price)],
    ["Liste", (p) => (p.compare_at ? money(p.compare_at) : "—")],
    ["Stok", (p) => (p.stock > 0 ? `${p.stock} adet` : "tükendi")],
    ["Kategori", (p) => p.category],
    ["SKU", (p) => p.sku],
    ["Beden", (p) => (p.sizes?.length ? p.sizes.join(", ") : "—")],
    ["Renk", (p) => (p.colors?.length ? p.colors.join(", ") : "—")],
  ];

  return (
    <div
      className="compare-tray"
      data-cta="compare-tray"
      data-compare-url={itemIds.join(",") || undefined}
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
              <Link href={`/urun/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>{p.name}</Link>
              <button type="button" aria-label="Çıkar" data-cta="compare-remove" onClick={() => remove(p.id)} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <button className="chip" type="button" data-cta="compare-open" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "Tabloyu gizle" : "Tabloyu aç"}</button>
        <button className="chip on" type="button" data-cta="compare-add-all" disabled={busy || !items.some((p) => p.stock > 0)} onClick={() => void addAll()}>{busy ? "…" : "Hepsini sepete"}</button>
        <button className="chip" type="button" data-cta="compare-copy-link" onClick={() => void copyLink()}>{copied ? "Kopyalandı" : "Linki kopyala"}</button>
        <button className="chip" type="button" data-cta="compare-clear" onClick={() => { forceClearUrl.current = true; clear(); }}>Temizle</button>
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
              {rows.map(([label, fn]) => (
                <tr key={label}>
                  <td className="faint" style={{ padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.06)" }}>{label}</td>
                  {items.map((p) => (
                    <td key={p.id} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(11,11,11,0.06)" }}>{fn(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="faint" style={{ padding: "8px" }}>Sepet</td>
                {items.map((p) => (
                  <td key={p.id} style={{ padding: "8px" }}>
                    <button className="btn btn-primary quick" type="button" disabled={p.stock <= 0} data-cta="compare-add-one" onClick={() => void add(p.id, 1)}>
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
