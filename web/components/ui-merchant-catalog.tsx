"use client";
import Link from "next/link";
import type { Alert, Product } from "@/lib/core";
import { money, qualityScore } from "@/lib/core";

export function CatalogTable({ products }: { products: Product[] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead><tr><th></th><th>Ürün</th><th>SKU</th><th>Stok</th><th>Fiyat</th><th>Kalite</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => {
            const q = qualityScore(p);
            return (
              <tr key={p.id}>
                <td><img src={p.image} alt="" width={36} height={45} style={{ width: 36, height: 45, objectFit: "cover", borderRadius: 6 }} /></td>
                <td>{p.name}<div className="faint">{p.category}</div></td>
                <td className="faint">{p.sku}</td>
                <td>{p.stock}</td>
                <td>{money(p.price)}</td>
                <td><span className="score">{q}<i><b style={{ width: `${q}%` }} /></i></span></td>
                <td><Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(p.name + " başlığını düzelt")}`}>Düzelt</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StockView({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="list">
      {alerts.map((a) => (
        <div className="list-row" key={`${a.kind}-${a.product_id}`}>
          <div>
            <div>{a.product_name}</div>
            <div className="faint">stok {a.stock} · cover {a.days_cover ?? "—"} gün{a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""}</div>
          </div>
          <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük" : "yavaş"}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + " stok yenile")}`}>Yenile</Link>
        </div>
      ))}
      {alerts.length === 0 ? <div className="list-row"><span className="muted">Uyarı yok.</span></div> : null}
    </div>
  );
}
