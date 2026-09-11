"use client";
import Link from "next/link";
import type { Issue, Order } from "@/lib/core";
import { STATUS_LABEL, canCancelOrder, isStoreCheckoutOrder, money, nextOrderAction, shortDate } from "@/lib/core";
import { CARRIERS, shipNoteLabel } from "@/components/ui-ship-track";
import { BuyerPrefChips } from "@/components/ui-merchant-buyer-tags";
import { MerchantCouponLine } from "@/components/ui-merchant-coupon";
import { MerchantTipLine } from "@/components/ui-merchant-tip";
import { MerchantMontajLine } from "@/components/ui-merchant-montaj";
import { MerchantGiftLine } from "@/components/ui-merchant-gift";
import { MerchantInvoiceLine } from "@/components/ui-merchant-invoice";
import { MerchantAmbalajLine } from "@/components/ui-merchant-ambalaj";
import { MerchantEcoLine } from "@/components/ui-merchant-eco";
import { MerchantGizliLine } from "@/components/ui-merchant-gizli";
import { MerchantImzaLine } from "@/components/ui-merchant-imza";
import { MerchantFragileLine } from "@/components/ui-merchant-fragile";
import { MerchantDoormanLine } from "@/components/ui-merchant-doorman";
import { MerchantInsuranceLine } from "@/components/ui-merchant-insurance";
import { MerchantKomsuLine } from "@/components/ui-merchant-komsu";
import { MerchantPaketmatikLine } from "@/components/ui-merchant-paketmatik";
import { MerchantErisimLine } from "@/components/ui-merchant-erisim";
import { MerchantWarrantyLine } from "@/components/ui-merchant-warranty";
import { MerchantDestekLine } from "@/components/ui-merchant-destek";
import { MerchantTaksitLine } from "@/components/ui-merchant-taksit";
import { MerchantNotifyLine } from "@/components/ui-merchant-notify";
import { lineSummary, statusTone } from "@/components/ui-merchant-orders-filters";

type ShipDraft = Record<string, { carrier: string; tracking: string }>;

export function OrderRow({
  o,
  issue,
  open,
  highlight,
  busy,
  shipDraft,
  setShipDraft,
  onAct,
  pref,
  onPrefSelect,
}: {
  o: Order;
  issue?: Issue;
  open: boolean;
  highlight: string;
  busy: string | null;
  shipDraft: ShipDraft;
  setShipDraft: (fn: (d: ShipDraft) => ShipDraft) => void;
  onAct: (orderId: string, action: string) => void;
  pref?: string | null;
  onPrefSelect?: (key: string) => void;
}) {
  const cta = nextOrderAction(o.status);
  return (
    <div className={`list-row ops-row${highlight === o.id ? " hl" : ""}`} key={o.id}>
      <div>
        <div>
          <strong style={{ fontWeight: 600 }}>{o.id}</strong>
          <span className="faint"> · {shortDate(o.created_at)}</span>
          {isStoreCheckoutOrder(o.id) ? <span className="tag accent">mağaza</span> : null}
        </div>
        <div className="faint">{lineSummary(o)}</div>
        {issue ? <div className="faint">{issue.message}</div> : null}
        {o.ship_note ? (
          <div className="faint" data-cta="merchant-ship-note">
            Kargo · {shipNoteLabel(o.ship_note) ?? o.ship_note}
          </div>
        ) : null}
        <MerchantCouponLine note={o.buyer_note} />
        <MerchantTipLine note={o.buyer_note} />
        <MerchantMontajLine note={o.buyer_note} />
        <MerchantGiftLine note={o.buyer_note} />
        <MerchantInvoiceLine note={o.buyer_note} />
        <MerchantAmbalajLine note={o.buyer_note} />
        <MerchantEcoLine note={o.buyer_note} />
        <MerchantGizliLine note={o.buyer_note} />
        <MerchantImzaLine note={o.buyer_note} />
        <MerchantFragileLine note={o.buyer_note} />
        <MerchantDoormanLine note={o.buyer_note} />
        <MerchantInsuranceLine note={o.buyer_note} />
        <MerchantKomsuLine note={o.buyer_note} />
        <MerchantPaketmatikLine note={o.buyer_note} />
        <MerchantErisimLine note={o.buyer_note} />
        <MerchantWarrantyLine note={o.buyer_note} />
        <MerchantDestekLine note={o.buyer_note} />
        <MerchantTaksitLine note={o.buyer_note} />
        <MerchantNotifyLine note={o.buyer_note} />
        <BuyerPrefChips note={o.buyer_note} activeKey={pref} onSelectKey={onPrefSelect} />
        {o.status === "paid" && cta?.action === "ship" ? (
          <div style={{ marginTop: 8 }} data-cta="ship-track-fields">
            <div className="chips" style={{ flexWrap: "wrap" }} aria-label="Kargo firması">
              {CARRIERS.map((c) => {
                const on = (shipDraft[o.id]?.carrier ?? "") === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chip ${on ? "on" : ""}`}
                    data-cta="ship-carrier"
                    data-carrier={c.id}
                    disabled={busy === o.id || busy === "bulk"}
                    onClick={() =>
                      setShipDraft((d) => ({
                        ...d,
                        [o.id]: { carrier: c.id, tracking: d[o.id]?.tracking ?? "" },
                      }))
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <input
              className="input"
              type="text"
              data-cta="ship-tracking"
              placeholder="Takip no (opsiyonel)"
              aria-label="Kargo takip numarası"
              value={shipDraft[o.id]?.tracking ?? ""}
              disabled={busy === o.id || busy === "bulk"}
              onChange={(e) =>
                setShipDraft((d) => ({
                  ...d,
                  [o.id]: {
                    carrier: d[o.id]?.carrier ?? "",
                    tracking: e.target.value.slice(0, 64),
                  },
                }))
              }
              style={{ marginTop: 8, maxWidth: 280 }}
            />
          </div>
        ) : null}
      </div>
      <div style={{ textAlign: "right" }}>
        <strong style={{ fontVariantNumeric: "tabular-nums" }}>{money(o.total)}</strong>
        <div>
          <span className={`tag ${statusTone(o.status, open)}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
        </div>
      </div>
      <div className="row-actions">
        {cta ? (
          <button
            className="btn btn-primary btn-sm"
            type="button"
            disabled={busy === o.id || busy === "bulk"}
            onClick={() => void onAct(o.id, cta.action)}
          >
            {busy === o.id ? "…" : cta.label}
          </button>
        ) : null}
        {canCancelOrder(o.status) ? (
          <button
            className="btn btn-danger btn-sm"
            type="button"
            disabled={busy === o.id || busy === "bulk"}
            onClick={() => void onAct(o.id, "cancel")}
          >
            {busy === o.id ? "…" : "İptal"}
          </button>
        ) : null}
        <Link className="btn btn-sm" href={`/merchant/sohbet?q=${encodeURIComponent(o.id)}`}>
          Sor
        </Link>
      </div>
    </div>
  );
}
