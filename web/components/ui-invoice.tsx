"use client";
import { useEffect, useState } from "react";

const INVOICE_KEY = "qante_invoice";

export type InvoiceKind = "bireysel" | "kurumsal";

export type InvoiceInfo = {
  enabled: boolean;
  kind: InvoiceKind;
  company: string;
  taxId: string;
  taxOffice: string;
};

const EMPTY: InvoiceInfo = {
  enabled: false,
  kind: "bireysel",
  company: "",
  taxId: "",
  taxOffice: "",
};

export function readInvoice(): InvoiceInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(INVOICE_KEY) || "null") as Partial<InvoiceInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const kind = raw.kind === "kurumsal" ? "kurumsal" : "bireysel";
    return {
      enabled: Boolean(raw.enabled),
      kind,
      company: typeof raw.company === "string" ? raw.company.slice(0, 80) : "",
      taxId: typeof raw.taxId === "string" ? raw.taxId.slice(0, 20) : "",
      taxOffice: typeof raw.taxOffice === "string" ? raw.taxOffice.slice(0, 40) : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeInvoice(info: InvoiceInfo) {
  try {
    localStorage.setItem(INVOICE_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-invoice"));
  } catch {
    /* ignore */
  }
}

export function clearInvoice() {
  try {
    localStorage.removeItem(INVOICE_KEY);
    window.dispatchEvent(new CustomEvent("qante-invoice"));
  } catch {
    /* ignore */
  }
}

/** Compact tag for order note (fits checkout note budget). */
export function formatInvoiceTag(info: InvoiceInfo = readInvoice()): string | null {
  if (!info.enabled) return null;
  if (info.kind === "bireysel") return "[fatura:bireysel]";
  const company = info.company.trim();
  const taxId = info.taxId.trim();
  const taxOffice = info.taxOffice.trim();
  const parts = [company, taxId, taxOffice].filter(Boolean);
  return parts.length ? `[fatura:kurumsal|${parts.join("|")}]` : "[fatura:kurumsal]";
}

export function parseInvoiceFromNote(note?: string): { kind: InvoiceKind; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[fatura:(bireysel|kurumsal)(?:\|([^\]]*))?\]/i);
  if (!m?.[1]) return null;
  const kind = m[1].toLowerCase() === "kurumsal" ? "kurumsal" : "bireysel";
  if (kind === "bireysel") return { kind, label: "Bireysel" };
  const rest = (m[2] ?? "").trim();
  const parts = rest ? rest.split("|").map((s) => s.trim()).filter(Boolean) : [];
  const label = parts.length ? `Kurumsal · ${parts.join(" · ")}` : "Kurumsal";
  return { kind, label };
}

/** Cart /sepet + drawer: demo invoice type, localStorage only. */
export function InvoiceField() {
  const [info, setInfo] = useState<InvoiceInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readInvoice());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-invoice", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-invoice", sync);
    };
  }, []);

  function patch(partial: Partial<InvoiceInfo>) {
    const next = { ...info, ...partial };
    setInfo(next);
    writeInvoice(next);
  }

  const summary =
    info.enabled && info.kind === "kurumsal" && info.company.trim()
      ? info.company.trim()
      : info.enabled
        ? info.kind === "kurumsal"
          ? "Kurumsal"
          : "Bireysel"
        : "";

  return (
    <div style={{ marginBottom: 12 }} data-cta="invoice-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button
          className={`chip ${info.enabled ? "on" : ""}`}
          type="button"
          aria-pressed={info.enabled}
          data-cta="invoice-toggle"
          onClick={() => patch({ enabled: !info.enabled, kind: info.kind || "bireysel" })}
        >
          Fatura{info.enabled && summary ? ` · ${summary}` : ""}
        </button>
        {info.enabled ? (
          <button
            className="chip"
            type="button"
            data-cta="invoice-clear"
            onClick={() => {
              clearInvoice();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      {info.enabled ? (
        <div style={{ marginTop: 8 }} data-cta="invoice-form">
          <div className="chips" style={{ marginBottom: 8 }} role="group" aria-label="Fatura türü">
            <button
              className={`chip ${info.kind === "bireysel" ? "on" : ""}`}
              type="button"
              data-cta="invoice-bireysel"
              aria-pressed={info.kind === "bireysel"}
              onClick={() => patch({ kind: "bireysel", enabled: true })}
            >
              Bireysel
            </button>
            <button
              className={`chip ${info.kind === "kurumsal" ? "on" : ""}`}
              type="button"
              data-cta="invoice-kurumsal"
              aria-pressed={info.kind === "kurumsal"}
              onClick={() => patch({ kind: "kurumsal", enabled: true })}
            >
              Kurumsal
            </button>
          </div>
          {info.kind === "kurumsal" ? (
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ display: "block" }}>
                <span className="faint" style={{ display: "block", marginBottom: 4 }}>Şirket ünvanı</span>
                <input
                  className="search"
                  value={info.company}
                  placeholder="Nivorius GmbH"
                  aria-label="Şirket ünvanı"
                  data-cta="invoice-company"
                  maxLength={80}
                  onChange={(e) => patch({ company: e.target.value.slice(0, 80), enabled: true, kind: "kurumsal" })}
                  style={{ width: "100%" }}
                />
              </label>
              <label style={{ display: "block" }}>
                <span className="faint" style={{ display: "block", marginBottom: 4 }}>Vergi no</span>
                <input
                  className="search"
                  value={info.taxId}
                  placeholder="1234567890"
                  aria-label="Vergi no"
                  data-cta="invoice-tax-id"
                  inputMode="numeric"
                  maxLength={20}
                  onChange={(e) => patch({ taxId: e.target.value.slice(0, 20), enabled: true, kind: "kurumsal" })}
                  style={{ width: "100%" }}
                />
              </label>
              <label style={{ display: "block" }}>
                <span className="faint" style={{ display: "block", marginBottom: 4 }}>Vergi dairesi</span>
                <input
                  className="search"
                  value={info.taxOffice}
                  placeholder="Kadıköy"
                  aria-label="Vergi dairesi"
                  data-cta="invoice-tax-office"
                  maxLength={40}
                  onChange={(e) => patch({ taxOffice: e.target.value.slice(0, 40), enabled: true, kind: "kurumsal" })}
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          ) : null}
          <p className="faint" style={{ marginTop: 6, marginBottom: 0 }}>
            Demo fatura · checkout notuna yazılır · ikas&apos;a gitmez
          </p>
        </div>
      ) : (
        <p className="faint" style={{ marginTop: 6, marginBottom: 0 }}>
          Bireysel veya kurumsal fatura · demo · ikas&apos;a gitmez
        </p>
      )}
    </div>
  );
}

export { INVOICE_KEY };
