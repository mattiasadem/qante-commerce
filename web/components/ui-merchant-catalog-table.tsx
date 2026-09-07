"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, StagedChange } from "@/lib/core";
import { money, qualityScore, suggestPriceCut, suggestRestockQty } from "@/lib/core";

/** Case-insensitive match on name, sku, category, id. */
export function productMatchesQuery(p: Product, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (p.id.toLowerCase().includes(needle)) return true;
  if (p.name.toLowerCase().includes(needle)) return true;
  if ((p.sku ?? "").toLowerCase().includes(needle)) return true;
  if ((p.category ?? "").toLowerCase().includes(needle)) return true;
  return false;
}

export type CatalogSortId = "name" | "stock_asc" | "price_desc" | "quality_asc";

export const CATALOG_SORTS: { id: CatalogSortId; label: string }[] = [
  { id: "name", label: "Ad A\u2192Z" },
  { id: "stock_asc", label: "Stok \u2191" },
  { id: "price_desc", label: "Fiyat \u2193" },
  { id: "quality_asc", label: "Kalite \u2191" },
];

export function compareProductsBySort(a: Product, b: Product, sort: CatalogSortId): number {
  if (sort === "stock_asc") {
    const d = a.stock - b.stock;
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, "tr");
  }
  if (sort === "price_desc") {
    const d = b.price - a.price;
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, "tr");
  }
  if (sort === "quality_asc") {
    const d = qualityScore(a) - qualityScore(b);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, "tr");
  }
  return a.name.localeCompare(b.name, "tr");
}

export function CatalogTable({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "low" | "out" | "weak">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<CatalogSortId>("name");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const rows = useMemo(() => {
    const filtered = products.filter((p) => {
      const score = qualityScore(p);
      if (filter === "low" && !(p.stock > 0 && p.stock <= 5)) return false;
      if (filter === "out" && !(p.stock <= 0)) return false;
      if (filter === "weak" && !(score < 70)) return false;
      return productMatchesQuery(p, q);
    });
    return [...filtered].sort((a, b) => compareProductsBySort(a, b, sort));
  }, [products, filter, q, sort]);

  const discountIds = useMemo(() => rows.slice(0, 12).map((p) => p.id), [rows]);

  async function stageChange(p: Product, kind: "listing" | "price" | "stock") {
    setBusy(`${p.id}:${kind}`);
    setFlash(null);
    try {
      const body: Record<string, string | number> = { kind, product_id: p.id };
      if (kind === "price") body.target_price = suggestPriceCut(p);
      if (kind === "stock") body.target_qty = suggestRestockQty(p.stock);
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyru\u011fa yaz\u0131lamad\u0131");
        return;
      }
      if (kind === "listing") {
        const afterTitle = data.change.after.ba\u015fl\u0131k ?? data.change.after["ba\u015fl\u0131k"] ?? p.name;
        setFlash(`${data.change.product_name} \u00b7 liste \u2192 Bekleyen (${afterTitle})`);
      } else if (kind === "stock") {
        setFlash(`${data.change.product_name} \u00b7 ${data.change.before.stok} \u2192 ${data.change.after.stok} Bekleyen'e eklendi`);
      } else {
        setFlash(`${data.change.product_name} \u00b7 ${data.change.before.fiyat} \u2192 ${data.change.after.fiyat} Bekleyen'e eklendi`);
      }
    } finally {
      setBusy(null);
    }
  }

  async function stageDiscountAll() {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "price_all", kind: "price", product_ids: discountIds }),
      });
      const data = await res.json() as { changes?: StagedChange[]; count?: number; error?: string };
      if (!res.ok || !data.changes?.length) {
        setFlash(data.error ?? "Toplu indirim yaz\u0131lamad\u0131");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} fiyat \u00f6nerisi Bekleyen'e eklendi \u00b7 ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }


  async function stageListingAll() {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "listing_all", kind: "listing", product_ids: discountIds }),
      });
      const data = await res.json() as { changes?: StagedChange[]; count?: number; error?: string };
      if (!res.ok || !data.changes?.length) {
        setFlash(data.error ?? "Toplu d\u00fczelt yaz\u0131lamad\u0131");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} liste \u00f6nerisi Bekleyen'e eklendi \u00b7 ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageRestockAllCatalog() {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restock_all", kind: "stock", product_ids: discountIds }),
      });
      const data = await res.json() as { changes?: StagedChange[]; count?: number; error?: string };
      if (!res.ok || !data.changes?.length) {
        setFlash(data.error ?? "Toplu yenile yaz\u0131lamad\u0131");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} stok \u00f6nerisi Bekleyen'e eklendi \u00b7 ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Katalog filtresi">
        {([
          ["all", "T\u00fcm\u00fc", products.length],
          ["low", "D\u00fc\u015f\u00fck stok", products.filter((p) => p.stock > 0 && p.stock <= 5).length],
          ["out", "T\u00fckendi", products.filter((p) => p.stock <= 0).length],
          ["weak", "Kalite <70", products.filter((p) => qualityScore(p) < 70).length],
        ] as const).map(([id, label, n]) => (
          <button key={id} className={`chip ${filter === id ? "on" : ""}`} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} {n}
          </button>
        ))}
      </div>
      <div className="ops-search" data-cta="catalog-search" style={{ marginTop: 10, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 80))}
          placeholder="Ara \u00b7 \u00fcr\u00fcn, SKU, kategori\u2026"
          aria-label="Katalog ara"
          data-cta="catalog-search-input"
          style={{ flex: "1 1 220px", maxWidth: 420 }}
        />
        {q.trim() ? (
          <button className="btn btn-sm" type="button" data-cta="catalog-search-clear" onClick={() => setQ("")}>
            Temizle
          </button>
        ) : null}
        <span className="faint">{q.trim() ? `${rows.length} \u00fcr\u00fcn` : "filtre \u00fcst\u00fcnde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="S\u0131ralama" data-cta="catalog-sort-rail" style={{ marginTop: 8, marginBottom: 12 }}>
        {CATALOG_SORTS.map((s) => (
          <button
            key={s.id}
            className={`chip ${sort === s.id ? "on" : ""}`}
            type="button"
            aria-pressed={sort === s.id}
            data-cta="catalog-sort"
            data-sort={s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {discountIds.length ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void stageDiscountAll()}
          >
            {busy === "bulk" ? "\u2026" : `Toplu indirim (${discountIds.length})`}
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void stageListingAll()}
          >
            {busy === "bulk" ? "\u2026" : `Toplu d\u00fczelt (${discountIds.length})`}
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void stageRestockAllCatalog()}
          >
            {busy === "bulk" ? "\u2026" : `Toplu yenile (${discountIds.length})`}
          </button>
          <span className="faint">g\u00f6r\u00fcnen filtre \u00b7 yerel kuyruk \u00b7 ikas kapal\u0131</span>
        </div>
      ) : null}
      {flash ? (
        <p className="muted">
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen&apos;e git</Link>
        </p>
      ) : (
        <p className="muted">
          Ara + s\u0131rala + filtre \u00b7 Toplu indirim / Toplu d\u00fczelt / Toplu yenile / D\u00fczelt / \u0130ndirim / Yenile yerel kuyru\u011fa yazar \u00b7 Onayla ikas&apos;a gitmez
        </p>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th></th><th>\u00dcr\u00fcn</th><th>SKU</th><th>Stok</th><th>Fiyat</th><th>Kalite</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => {
              const score = qualityScore(p);
              return (
                <tr key={p.id}>
                  <td><img src={p.image} alt="" width={32} height={40} style={{ width: 32, height: 40, objectFit: "cover", borderRadius: 4, border: "1px solid var(--hairline)" }} /></td>
                  <td>{p.name}<div className="faint">{p.category}</div></td>
                  <td className="faint">{p.sku}</td>
                  <td>{p.stock}</td>
                  <td>{money(p.price)}</td>
                  <td><span className="score">{score}<i><b style={{ width: `${score}%` }} /></i></span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-primary btn-sm" type="button" disabled={busy === `${p.id}:listing` || busy === "bulk"} onClick={() => void stageChange(p, "listing")}>
                        {busy === `${p.id}:listing` ? "\u2026" : "D\u00fczelt"}
                      </button>
                      <button className="btn btn-sm" type="button" disabled={busy === `${p.id}:price` || busy === "bulk"} onClick={() => void stageChange(p, "price")}>
                        {busy === `${p.id}:price` ? "\u2026" : "\u0130ndirim"}
                      </button>
                      <button className="btn btn-sm" type="button" disabled={busy === `${p.id}:stock` || busy === "bulk"} onClick={() => void stageChange(p, "stock")} title={`\u00f6neri ${suggestRestockQty(p.stock)}`}>
                        {busy === `${p.id}:stock` ? "\u2026" : "Yenile"}
                      </button>
                      <Link className="btn btn-sm" href={`/merchant/sohbet?q=${encodeURIComponent(p.name + " ba\u015fl\u0131\u011f\u0131n\u0131 d\u00fczelt")}`}>Sor</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="faint pad-sm">{q.trim() ? "Aramada \u00fcr\u00fcn yok." : "Bu filtrede \u00fcr\u00fcn yok."}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
