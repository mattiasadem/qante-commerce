"use client";
import { useEffect, useState } from "react";

const CARRIER_KEY = "qante_ship_carrier";

export type PrefCarrier = "yurtici" | "mng" | "aras" | "surat";

export type ShipCarrierInfo = {
  carrier: PrefCarrier | null;
};

const LABELS: Record<PrefCarrier, string> = {
  yurtici: "Yurtiçi",
  mng: "MNG",
  aras: "Aras",
  surat: "Sürat",
};

const CARRIERS: PrefCarrier[] = ["yurtici", "mng", "aras", "surat"];

const EMPTY: ShipCarrierInfo = { carrier: null };

export function readShipCarrier(): ShipCarrierInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(CARRIER_KEY) || "null") as Partial<ShipCarrierInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const c = raw.carrier;
    if (c === "yurtici" || c === "mng" || c === "aras" || c === "surat") return { carrier: c };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipCarrier(info: ShipCarrierInfo) {
  try {
    if (!info.carrier) localStorage.removeItem(CARRIER_KEY);
    else localStorage.setItem(CARRIER_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-carrier"));
  } catch {
    /* ignore */
  }
}

export function clearShipCarrier() {
  writeShipCarrier({ ...EMPTY });
}

export function shipCarrierLabel(carrier: PrefCarrier | null | undefined): string | null {
  if (!carrier) return null;
  return LABELS[carrier] ?? null;
}

/** Compact tag for order note — distinct from merchant [kargo:…] tracking. */
export function formatShipCarrierTag(info: ShipCarrierInfo = readShipCarrier()): string | null {
  if (!info.carrier) return null;
  return `[firma:${info.carrier}]`;
}

export function parseShipCarrierFromNote(note?: string): { carrier: PrefCarrier; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[firma:(yurtici|mng|aras|surat)\]/i);
  if (!m) return null;
  const carrier = m[1].toLowerCase() as PrefCarrier;
  return { carrier, label: LABELS[carrier] };
}

/** Cart /sepet + drawer: preferred carrier chips, localStorage only. */
export function ShipCarrierField() {
  const [info, setInfo] = useState<ShipCarrierInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipCarrier());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-carrier", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-carrier", sync);
    };
  }, []);

  function pick(carrier: PrefCarrier) {
    const next = { carrier: info.carrier === carrier ? null : carrier };
    writeShipCarrier(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-carrier-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Kargo firması</span>
        {info.carrier ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-carrier-clear"
            onClick={() => {
              clearShipCarrier();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Kargo firması" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CARRIERS.map((c) => (
          <button
            key={c}
            className={`chip ${info.carrier === c ? "on" : ""}`}
            type="button"
            aria-pressed={info.carrier === c}
            data-cta={`ship-carrier-${c}`}
            onClick={() => pick(c)}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.carrier
          ? `Tercih · ${LABELS[info.carrier]} · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı tercih · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { CARRIER_KEY, LABELS as SHIP_CARRIER_LABELS };
