"use client";
import { useEffect, useState } from "react";

const PAYMENT_KEY = "qante_payment";

export type PaymentMethod = "kart" | "havale" | "kapida";

export type PaymentInfo = {
  method: PaymentMethod | null;
};

const LABELS: Record<PaymentMethod, string> = {
  kart: "Kart",
  havale: "Havale / EFT",
  kapida: "Kapıda ödeme",
};

const METHODS: PaymentMethod[] = ["kart", "havale", "kapida"];

const EMPTY: PaymentInfo = { method: null };

export function readPayment(): PaymentInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(PAYMENT_KEY) || "null") as Partial<PaymentInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.method;
    if (m === "kart" || m === "havale" || m === "kapida") return { method: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writePayment(info: PaymentInfo) {
  try {
    if (!info.method) localStorage.removeItem(PAYMENT_KEY);
    else localStorage.setItem(PAYMENT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-payment"));
  } catch {
    /* ignore */
  }
}

export function clearPayment() {
  writePayment({ ...EMPTY });
}

export function paymentLabel(method: PaymentMethod | null | undefined): string | null {
  if (!method) return null;
  return LABELS[method] ?? null;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatPaymentTag(info: PaymentInfo = readPayment()): string | null {
  if (!info.method) return null;
  return `[odeme:${info.method}]`;
}

export function parsePaymentFromNote(note?: string): { method: PaymentMethod; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[odeme:(kart|havale|kapida)\]/i);
  if (!m) return null;
  const method = m[1].toLowerCase() as PaymentMethod;
  return { method, label: LABELS[method] };
}

/** Cart /sepet + drawer: demo payment method chips, localStorage only. */
export function PaymentField() {
  const [info, setInfo] = useState<PaymentInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readPayment());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-payment", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-payment", sync);
    };
  }, []);

  function pick(method: PaymentMethod) {
    const next = { method: info.method === method ? null : method };
    writePayment(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="payment-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Ödeme yöntemi</span>
        {info.method ? (
          <button
            className="chip"
            type="button"
            data-cta="payment-clear"
            onClick={() => {
              clearPayment();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Ödeme yöntemi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {METHODS.map((m) => (
          <button
            key={m}
            className={`chip ${info.method === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.method === m}
            data-cta={`payment-${m}`}
            onClick={() => pick(m)}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.method
          ? `Seçilen · ${LABELS[info.method]} · demo · checkout notuna yazılır · ikas&apos;a gitmez`
          : "Kart, havale veya kapıda · demo · ikas&apos;a gitmez"}
      </p>
    </div>
  );
}

export { PAYMENT_KEY, LABELS as PAYMENT_LABELS };
