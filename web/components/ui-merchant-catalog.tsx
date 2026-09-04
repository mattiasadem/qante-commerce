"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Alert, Product, StagedChange } from "@/lib/core";
import { money, qualityScore, suggestPriceCut, suggestRestockQty } from "@/lib/core";

const STOCK_FILTERS: { id: string; label: string; match: (a: Alert) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "out_of_stock", label: "Tükendi", match: (a) => a.kind === "out_of_stock" },
  { id: "low_stock", label: "Düşük", match: (a) => a.kind === "low_stock" },
  { id: "slow_mover", label: "Yavaş", match: (a) => a.kind === "slow_mover" },
];

export function CatalogTable({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "low" | "out" | "weak">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const rows = useMemo(() => {
    return products.filter((p) => {
      const q = qualityScore(p);
      if (filter === "low") return p.stock > 0 && p.stock <= 5;
      if (filter === "out") return p.stock <= 0;
      if (filter === "weak") return q < 70;
      return true;
    });
  }, [products, filter]);

  async function stageChange(p: Product, kind: "listing" | "price") {
    setBusy(`${p.id}:${kind}`);
    setFlash(null);
    try {
      const body: Record<string, string | number> = { kind, product_id: p.id };
      if (kind === "price") body.target_price = suggestPriceCut(p);
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
      } else {
        setFlash(`${data.change.product_name} · ${data.change.before.fiyat} → ${data.change.after.fiyat} Bekleyen'e eklendi`);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="chips scroll" role="tablist" aria-label="Katalog filtresi">
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
      {flash ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen'e git</Link>
        </p>
      ) : (
        <p className="muted" style={{ marginTop: -4, marginBottom: 16 }}>
          Düzelt liste, İndirim fiyat önerisi yazar · Onayla ikas'a gitmez
        </p>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th></th><th>Ürün</th><th>SKU</th><th>Stok</th><th>Fiyat</th><th>Kalite</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => {
              const q = qualityScore(p);
              return (
                <tr key={p.id}>
                  <td><img src={p.image} alt="" width={36} height={45} style={{ width: 36, height: 45, objectFit: "cover", borderRadius: 6 }} /></td>
                  <td>{p.name}<div className="faint">{p.category}</div></td>
                  <td className="faint">{p.sku}</td>
                  <td>{p.stock}</td>
                  <td>{money(p.price)}</td>
                  <td><span className="score">{q}<i><b style={{ width: `${q}%` }} /></i></span></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-primary" type="button" disabled={busy === `${p.id}:listing`} onClick={() => void stageChange(p, "listing")}>
                      {busy === `${p.id}:listing` ? "…" : "Düzelt"}
                    </button>{" "}
                    <button className="btn" type="button" disabled={busy === `${p.id}:price`} onClick={() => void stageChange(p, "price")}>
                      {busy === `${p.id}:price` ? "…" : "İndirim"}
                    </button>{" "}
                    <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(p.name + " başlığını düzelt")}`}>Sor</Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="faint" style={{ padding: 16 }}>Bu filtrede ürün yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function StockView({ alerts }: { alerts: Alert[] }) {
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of STOCK_FILTERS) c[f.id] = alerts.filter((a) => f.match(a)).length;
    return c;
  }, [alerts]);
  const match = STOCK_FILTERS.find((f) => f.id === filter) ?? STOCK_FILTERS[0];
  const rows = useMemo(() => alerts.filter((a) => match.match(a)), [alerts, match]);

  async function stageRestock(a: Alert) {
    setBusy(a.product_id);
    setFlash(null);
    try {
      const target = suggestRestockQty(a.stock);
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "stock", product_id: a.product_id, target_qty: target }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="chips scroll" role="tablist" aria-label="Stok filtresi">
        {STOCK_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "on" : ""}`} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen'e git</Link>
        </p>
      ) : (
        <p className="muted" style={{ marginTop: -4, marginBottom: 16 }}>
          Yenile yerel kuyruğa stok önerisi yazar · Onayla ikas'a gitmez
        </p>
      )}
      <div className="list">
        {rows.map((a) => (
          <div className="list-row" key={`${a.kind}-${a.product_id}`}>
            <div>
              <div>{a.product_name}</div>
              <div className="faint">stok {a.stock} · cover {a.days_cover ?? "—"} gün{a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""} · öneri {suggestRestockQty(a.stock)}</div>
            </div>
            <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük" : "yavaş"}</span>
            <button className="btn btn-primary" type="button" disabled={busy === a.product_id} onClick={() => void stageRestock(a)}>
              {busy === a.product_id ? "…" : "Yenile"}
            </button>
            <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + " stok yenile")}`}>Sor</Link>
          </div>
        ))}
        {rows.length === 0 ? <div className="list-row"><span className="muted">Bu filtrede uyarı yok.</span></div> : null}
      </div>
    </>
  );
}
