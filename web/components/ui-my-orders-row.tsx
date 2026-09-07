"use client";
import Link from "next/link";
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
