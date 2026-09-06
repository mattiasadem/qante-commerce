"use client";
import { useEffect, useState } from "react";

const MODE_KEY = "qante_ship_mode";

export type ShipMode = "kargo" | "gelal";

export type ShipModeInfo = {
  mode: ShipMode | null;
};

const LABELS: Record<ShipMode, string> = {
  kargo: "Kargo",
  gelal: "Gel al",
};

const MODES: ShipMode[] = ["kargo", "gelal"];

const EMPTY: ShipModeInfo = { mode: null };

export function readShipMode(): ShipModeInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(MODE_KEY) || "null") as Partial<ShipModeInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "kargo" || m === "gelal") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipMode(info: ShipModeInfo) {
  try {
    if (!info.mode) localStorage.removeItem(MODE_KEY);
    else localStorage.setItem(MODE_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-mode"));
  } catch {
    /* ignore */
  }
}

export function clearShipMode() {
  writeShipMode({ ...EMPTY });
}

export function shipModeLabel(mode: ShipMode | null | undefined): string | null {
  if (!mode) return null;
  return LABELS[mode] ?? null;
}


/** Reactive pickup flag for ShipBar free-ship. */
export function useShipMode(): ShipModeInfo {
  const [info, setInfo] = useState<ShipModeInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readShipMode());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-mode", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-mode", sync);
    };
  }, []);
  return info;
}

/** True when Gel al (pickup) is selected — no shipping fee in demo. */
export function isPickup(info: ShipModeInfo = readShipMode()): boolean {
  return info.mode === "gelal";
}

/** Compact tag for order note (fits checkout note budget). */
export function formatShipModeTag(info: ShipModeInfo = readShipMode()): string | null {
  if (!info.mode) return null;
  return `[sekil:${info.mode}]`;
}

export function parseShipModeFromNote(note?: string): { mode: ShipMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[sekil:(kargo|gelal)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as ShipMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Kargo / Gel al chips, localStorage only. */
export function ShipModeField() {
  const [info, setInfo] = useState<ShipModeInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipMode());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-mode", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-mode", sync);
    };
  }, []);

  function pick(mode: ShipMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeShipMode(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-mode-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat şekli</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-mode-clear"
            onClick={() => {
              clearShipMode();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat şekli" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`ship-mode-${m}`}
            onClick={() => pick(m)}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode === "gelal"
          ? "Seçilen · Gel al · mağazadan teslim · kargo yok · demo · checkout notuna yazılır · ikas'a gitmez"
          : info.mode === "kargo"
            ? "Seçilen · Kargo · adrese gönderim · demo · checkout notuna yazılır · ikas'a gitmez"
            : "İsteğe bağlı şekil · Kargo veya Gel al · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { MODE_KEY, LABELS as SHIP_MODE_LABELS };
