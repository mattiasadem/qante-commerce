"use client";
import Link from "next/link";
import { useState } from "react";
import {
  canCancelOrder,
  canConfirmPayment,
  canConfirmReceived,
  canReorder,
  canRequestReturn,
  canWithdrawReturn,
  money,
  orderProgress,
  STATUS_LABEL,
} from "@/lib/core";
import { shipNoteLabel } from "@/components/ui-ship-track";
import { fmtWhen, statusTagClass, type LedgerAction, type Row } from "@/components/ui-my-orders-model";
import { MyOrderPrefLines } from "@/components/ui-my-orders-prefs";
import { MyOrderKuponLine } from "@/components/ui-my-orders-kupon";
import { MyOrderSaatLine } from "@/components/ui-my-orders-saat";
import { MyOrderGunLine } from "@/components/ui-my-orders-gun";
import { MyOrderHizLine } from "@/components/ui-my-orders-hiz";
import { MyOrderOdemeLine } from "@/components/ui-my-orders-odeme";
import { MyOrderSekilLine } from "@/components/ui-my-orders-sekil";
import { MyOrderIletisimLine } from "@/components/ui-my-orders-iletisim";
import { MyOrderFaturaLine } from "@/components/ui-my-orders-fatura";
import { MyOrderBahsisLine } from "@/components/ui-my-orders-bahsis";
import { MyOrderTaksitLine } from "@/components/ui-my-orders-taksit";
import { MyOrderFirmaLine } from "@/components/ui-my-orders-firma";
import { MyOrderTalimatLine } from "@/components/ui-my-orders-talimat";
import { MyOrderAliciLine } from "@/components/ui-my-orders-alici";
import { MyOrderMontajLine } from "@/components/ui-my-orders-montaj";
import { MyOrderHediyeLine } from "@/components/ui-my-orders-hediye";
import { MyOrderAmbalajLine } from "@/components/ui-my-orders-ambalaj";
import { MyOrderEcoLine } from "@/components/ui-my-orders-eko";
import { MyOrderGizliLine } from "@/components/ui-my-orders-gizli";
import { MyOrderImzaLine } from "@/components/ui-my-orders-imza";
import { MyOrderKirilganLine } from "@/components/ui-my-orders-kirilgan";
import { MyOrderKapiciLine } from "@/components/ui-my-orders-kapici";
import { MyOrderSigortaLine } from "@/components/ui-my-orders-sigorta";
import { MyOrderKomsuLine } from "@/components/ui-my-orders-komsu";
import { MyOrderPaketmatikLine } from "@/components/ui-my-orders-paketmatik";
import { MyOrderErisimLine } from "@/components/ui-my-orders-erisim";
import { MyOrderGarantiLine } from "@/components/ui-my-orders-garanti";
import { MyOrderDestekLine } from "@/components/ui-my-orders-destek";
import { MyOrderIadeLine } from "@/components/ui-my-orders-iade";

export function MyOrderRow({
  o,
  busyId,
  onLedger,
  onReorder,
}: {
  o: Row;
  busyId: string | null;
  onLedger: (o: Row, action: LedgerAction) => void;
  onReorder: (o: Row) => void;
}) {
  const label = STATUS_LABEL[o.status] ?? o.status;
  const names = o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(" · ");
  const busy = busyId === o.order_id;
  const locked = busyId !== null;
  const progress = orderProgress(o.status);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(o.order_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1600);
    } catch {
      /* ignore */
    }
  }

  async function copyLink() {
    const path = `/siparis?id=${encodeURIComponent(o.order_id)}`;
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="list-row" key={o.order_id} style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/siparis?id=${encodeURIComponent(o.order_id)}`} data-cta="open-my-order">{o.order_id}</Link>
        <div className="faint" style={{ marginTop: 4 }}>
          {fmtWhen(o.created_at)} · {o.item_count} adet{names ? ` · ${names}` : ""}
        </div>
        <div style={{ marginTop: 8 }}>
          <span className={`tag ${statusTagClass(o.status)}`}>{label}</span>
        </div>
        <div className="chips" style={{ marginTop: 8, flexWrap: "wrap" }} aria-label="Sipariş adımları" data-cta="my-orders-progress">
          {progress.steps.map((step, i) => (
            <span key={step} className={`chip ${i <= progress.active ? "on" : ""}`}>{step}</span>
          ))}
        </div>
        {o.ship_note ? (
          <div className="faint" style={{ marginTop: 6 }} data-cta="my-orders-ship">
            Kargo · {shipNoteLabel(o.ship_note) ?? o.ship_note}
          </div>
        ) : null}
        <MyOrderPrefLines note={o.note} />
        <MyOrderKuponLine note={o.note} />
        <MyOrderSaatLine note={o.note} />
        <MyOrderGunLine note={o.note} />
        <MyOrderHizLine note={o.note} />
        <MyOrderOdemeLine note={o.note} />
        <MyOrderSekilLine note={o.note} />
        <MyOrderIletisimLine note={o.note} />
        <MyOrderFaturaLine note={o.note} />
        <MyOrderBahsisLine note={o.note} />
        <MyOrderTaksitLine note={o.note} />
        <MyOrderFirmaLine note={o.note} />
        <MyOrderTalimatLine note={o.note} />
        <MyOrderAliciLine note={o.note} />
        <MyOrderMontajLine note={o.note} />
        <MyOrderHediyeLine note={o.note} />
        <MyOrderAmbalajLine note={o.note} />
        <MyOrderEcoLine note={o.note} />
        <MyOrderGizliLine note={o.note} />
        <MyOrderImzaLine note={o.note} />
        <MyOrderKirilganLine note={o.note} />
        <MyOrderKapiciLine note={o.note} />
        <MyOrderSigortaLine note={o.note} />
        <MyOrderKomsuLine note={o.note} />
        <MyOrderPaketmatikLine note={o.note} />
        <MyOrderErisimLine note={o.note} />
        <MyOrderGarantiLine note={o.note} />
        <MyOrderDestekLine note={o.note} />
        <MyOrderIadeLine note={o.note} />
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }} data-cta="my-orders-copy-row">
          <button className="chip" type="button" data-cta="my-orders-copy-id" onClick={() => void copyId()}>
            {copiedId ? "No kopyalandı" : "No kopyala"}
          </button>
          <button className="chip" type="button" data-cta="my-orders-copy-order-link" onClick={() => void copyLink()}>
            {copiedLink ? "Kopyalandı" : "Linki kopyala"}
          </button>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <strong>{money(o.total)}</strong>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }} data-cta="my-orders-row-actions">
          <Link className="chip" href={`/siparis?id=${encodeURIComponent(o.order_id)}`}>Aç</Link>
          {canConfirmPayment(o.status) ? (
            <button className="chip" type="button" data-cta="pay-from-list" disabled={locked} onClick={() => onLedger(o, "mark_paid")}>{busy ? "…" : "Ödeme yaptım"}</button>
          ) : null}
          {canConfirmReceived(o.status) ? (
            <button className="chip" type="button" data-cta="receive-from-list" disabled={locked} onClick={() => onLedger(o, "fulfill")}>{busy ? "…" : "Teslim aldım"}</button>
          ) : null}
          {canCancelOrder(o.status) ? (
            <button className="chip" type="button" data-cta="cancel-from-list" disabled={locked} onClick={() => onLedger(o, "cancel")}>{busy ? "…" : "İptal"}</button>
          ) : null}
          {canRequestReturn(o.status) ? (
            <button className="chip" type="button" data-cta="return-from-list" disabled={locked} onClick={() => onLedger(o, "request_return")}>{busy ? "…" : "İade talep"}</button>
          ) : null}
          {canWithdrawReturn(o.status) ? (
            <button className="chip" type="button" data-cta="withdraw-return-from-list" disabled={locked} onClick={() => onLedger(o, "withdraw_return")}>{busy ? "…" : "İade geri al"}</button>
          ) : null}
          {canReorder(o.status) ? (
            <button className="chip" type="button" data-cta="reorder-from-list" disabled={locked} onClick={() => onReorder(o)}>{busy ? "…" : "Tekrar satın al"}</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
