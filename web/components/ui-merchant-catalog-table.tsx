"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  { id: "name", label: "Ad A→Z" },
  { id: "stock_asc", label: "Stok ↑" },
  { id: "price_desc", label: "Fiyat ↓" },
  { id: "quality_asc", label: "Kalite ↑" },
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

export type CatalogFilterId = "all" | "low" | "out" | "weak";

const CATALOG_FILTERS: CatalogFilterId[] = ["all", "low", "out", "weak"];

export function CatalogTable({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const filterParam = (params.get("filter") ?? params.get("stock") ?? "").trim().toLowerCase();
  const catParam = (params.get("cat") ?? "").trim();
  const qParam = (params.get("q") ?? "").trim();
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const initialFilter: CatalogFilterId = (CATALOG_FILTERS.includes(filterParam as CatalogFilterId) ? filterParam : "all") as CatalogFilterId;
  const initialSort: CatalogSortId = (CATALOG_SORTS.some((s) => s.id === sortParam) ? sortParam : "name") as CatalogSortId;

  const [filter, setFilter] = useState<CatalogFilterId>(initialFilter);
  const [cat, setCat] = useState<string>(catParam);
  const [q, setQ] = useState(qParam);
  const [sort, setSort] = useState<CatalogSortId>(initialSort);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (CATALOG_FILTERS.includes(filterParam as CatalogFilterId)) setFilter(filterParam as CatalogFilterId);
  }, [filterParam]);
  useEffect(() => {
    if (catParam) setCat(catParam);
  }, [catParam]);
  useEffect(() => {
    if (qParam) setQ(qParam);
  }, [qParam]);
  useEffect(() => {
    if (CATALOG_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as CatalogSortId);
  }, [sortParam]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const c = (p.category ?? "").trim();
      if (!c) continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [products]);
  const rows = useMemo(() => {
    const filtered = products.filter((p) => {
      const score = qualityScore(p);
      if (filter === "low" && !(p.stock > 0 && p.stock <= 5)) return false;
      if (filter === "out" && !(p.stock <= 0)) return false;
      if (filter === "weak" && !(score < 70)) return false;
      if (cat && (p.category ?? "") !== cat) return false;
      return productMatchesQuery(p, q);
    });
    return [...filtered].sort((a, b) => compareProductsBySort(a, b, sort));
  }, [products, filter, cat, q, sort]);

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
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      if (kind === "listing") {
        const afterTitle = data.change.after.başlık ?? data.change.after["başlık"] ?? p.name;
        setFlash(`${data.change.product_name} · liste → Bekleyen (${afterTitle})`);
      } else if (kind === "stock") {
        setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
      } else {
        setFlash(`${data.change.product_name} · ${data.change.before.fiyat} → ${data.change.after.fiyat} Bekleyen'e eklendi`);
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
        setFlash(data.error ?? "Toplu indirim yazılamadı");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} fiyat önerisi Bekleyen'e eklendi · ikas'a gitmedi`);
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
        setFlash(data.error ?? "Toplu düzelt yazılamadı");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} liste önerisi Bekleyen'e eklendi · ikas'a gitmedi`);
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
        setFlash(data.error ?? "Toplu yenile yazılamadı");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} stok önerisi Bekleyen'e eklendi · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  const urlFiltersOn = Boolean(
    (filterParam && filterParam !== "all") || catParam || qParam || (sortParam && sortParam !== "name"),
  );

  return (
    <div data-cta="catalog-deeplink">
      <div className="filter-rail chips scroll" role="tablist" aria-label="Katalog filtresi" data-cta="catalog-filter-rail">
        {([
          ["all", "Tümü", products.length],
          ["low", "Düşük stok", products.filter((p) => p.stock > 0 && p.stock <= 5).length],
          ["out", "Tükendi", products.filter((p) => p.stock <= 0).length],
          ["weak", "Kalite <70", products.filter((p) => qualityScore(p) < 70).length],
        ] as const).map(([id, label, n]) => (
          <button key={id} className={`chip ${filter === id ? "on" : ""}`} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} {n}
          </button>
        ))}
      </div>
      {categories.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="catalog-category-rail" style={{ marginTop: 8 }}>
          <button
            className={`chip ${cat === "" ? "on" : ""}`}
            type="button"
            aria-pressed={cat === ""}
            data-cta="catalog-category"
            data-cat=""
            onClick={() => setCat("")}
          >
            Tüm kategoriler
          </button>
          {categories.map(([name, n]) => (
            <button
              key={name}
              className={`chip ${cat === name ? "on" : ""}`}
              type="button"
              aria-pressed={cat === name}
              data-cta="catalog-category"
              data-cat={name}
              onClick={() => setCat(cat === name ? "" : name)}
            >
              {name} · {n}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ops-search" data-cta="catalog-search" style={{ marginTop: 10, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 80))}
          placeholder="Ara · ürün, SKU, kategori…"
          aria-label="Katalog ara"
          data-cta="catalog-search-input"
          style={{ flex: "1 1 220px", maxWidth: 420 }}
        />
        {q.trim() ? (
          <button className="btn btn-sm" type="button" data-cta="catalog-search-clear" onClick={() => setQ("")}>
            Temizle
          </button>
        ) : null}
        <span className="faint">{q.trim() ? `${rows.length} ürün` : "filtre üstünde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="catalog-sort-rail" style={{ marginTop: 8, marginBottom: 12 }}>
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
            {busy === "bulk" ? "…" : `Toplu indirim (${discountIds.length})`}
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void stageListingAll()}
          >
            {busy === "bulk" ? "…" : `Toplu düzelt (${discountIds.length})`}
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void stageRestockAllCatalog()}
          >
            {busy === "bulk" ? "…" : `Toplu yenile (${discountIds.length})`}
          </button>
          <span className="faint">görünen filtre · yerel kuyruk · ikas kapalı</span>
        </div>
      ) : null}
      {flash ? (
        <p className="muted">
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen&apos;e git</Link>
        </p>
      ) : (
        <p className="muted">
          Ara + kategori + sırala + filtre · Toplu indirim / Toplu düzelt / Toplu yenile / Düzelt / İndirim / Yenile yerel kuyruğa yazar · Onayla ikas&apos;a gitmez
          {urlFiltersOn ? " · URL filtreleri açık" : ""}
        </p>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th></th><th>Ürün</th><th>SKU</th><th>Stok</th><th>Fiyat</th><th>Kalite</th><th></th></tr></thead>
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
                        {busy === `${p.id}:listing` ? "…" : "Düzelt"}
                      </button>
                      <button className="btn btn-sm" type="button" disabled={busy === `${p.id}:price` || busy === "bulk"} onClick={() => void stageChange(p, "price")}>
                        {busy === `${p.id}:price` ? "…" : "İndirim"}
                      </button>
                      <button className="btn btn-sm" type="button" disabled={busy === `${p.id}:stock` || busy === "bulk"} onClick={() => void stageChange(p, "stock")} title={`öneri ${suggestRestockQty(p.stock)}`}>
                        {busy === `${p.id}:stock` ? "…" : "Yenile"}
                      </button>
                      <Link className="btn btn-sm" href={`/merchant/sohbet?q=${encodeURIComponent(p.name + " başlığını düzelt")}`}>Sor</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="faint pad-sm">{q.trim() ? "Aramada ürün yok." : cat ? "Bu kategoride ürün yok." : "Bu filtrede ürün yok."}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
