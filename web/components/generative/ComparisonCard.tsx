"use client";

import Link from "next/link";
import type { GenComparisonPayload } from "@/lib/stream-protocol";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell";

export function ComparisonCard({
  payload,
  partial,
}: {
  payload: GenComparisonPayload;
  partial?: boolean;
}) {
  const { add } = useCart();
  const entries = payload.entries ?? [];
  const empty = entries.length === 0;
  return (
    <section className="gen-card ac-reveal" data-component="comparison">
      <div className="gen-card-head">
        <h3 className="gen-title">{payload.title ?? "Yan yana"}</h3>
        {payload.recommended_product_id ? <span className="faint">Önerilen işaretli</span> : null}
      </div>
      <div className="gen-compare">
        {entries.map((entry, i) => {
          const recommended = entry.product_id === payload.recommended_product_id;
          const p = entry.product;
          return (
            <div
              key={entry.product_id}
              className={`gen-compare-col ac-reveal ${recommended ? "on" : ""}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {recommended ? <span className="tag accent">Önerilen</span> : <span className="tag">Alternatif</span>}
              <Link href={`/urun/${p.id}`}>
                <img src={p.image} alt={p.name} />
              </Link>
              <strong><Link href={`/urun/${p.id}`}>{p.name}</Link></strong>
              <div className="price">{money(p.price)}</div>
              {entry.best_for ? <div className="faint">{entry.best_for}</div> : null}
              {entry.pros?.length ? (
                <ul className="gen-pros">{entry.pros.map((x) => <li key={x}>+ {x}</li>)}</ul>
              ) : null}
              {entry.cons?.length ? (
                <ul className="gen-cons">{entry.cons.map((x) => <li key={x}>− {x}</li>)}</ul>
              ) : null}
              <button
                className={recommended ? "btn btn-primary" : "chip"}
                type="button"
                disabled={p.stock <= 0}
                onClick={() => void add(p.id)}
                style={{ marginTop: 8 }}
              >
                {p.stock <= 0 ? "Tükendi" : recommended ? "Önerileni ekle" : "Ekle"}
              </button>
            </div>
          );
        })}
        {(partial || empty) ? (
          <>
            <div className="ac-skeleton gen-skel" style={{ minHeight: 220 }} aria-hidden />
            {empty ? <div className="ac-skeleton gen-skel" style={{ minHeight: 220 }} aria-hidden /> : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
