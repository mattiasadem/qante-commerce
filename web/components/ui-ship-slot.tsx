"use client";
import { useEffect, useState } from "react";

const SLOT_KEY = "qante_ship_slot";

export type ShipSlot = "sabah" | "ogle" | "aksam";

export type ShipSlotInfo = {
  slot: ShipSlot | null;
};

const LABELS: Record<ShipSlot, string> = {
  sabah: "Sabah 09–12",
  ogle: "Öğle 12–17",
  aksam: "Akşam 17–21",
};

const SLOTS: ShipSlot[] = ["sabah", "ogle", "aksam"];

const EMPTY: ShipSlotInfo = { slot: null };

export function readShipSlot(): ShipSlotInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(SLOT_KEY) || "null") as Partial<ShipSlotInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const s = raw.slot;
    if (s === "sabah" || s === "ogle" || s === "aksam") return { slot: s };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipSlot(info: ShipSlotInfo) {
  try {
    if (!info.slot) localStorage.removeItem(SLOT_KEY);
    else localStorage.setItem(SLOT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-slot"));
  } catch {
    /* ignore */
  }
}

export function clearShipSlot() {
  writeShipSlot({ ...EMPTY });
}

export function shipSlotLabel(slot: ShipSlot | null | undefined): string | null {
  if (!slot) return null;
  return LABELS[slot] ?? null;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatShipSlotTag(info: ShipSlotInfo = readShipSlot()): string | null {
  if (!info.slot) return null;
  return `[saat:${info.slot}]`;
}

export function parseShipSlotFromNote(note?: string): { slot: ShipSlot; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[saat:(sabah|ogle|aksam)\]/i);
  if (!m) return null;
  const slot = m[1].toLowerCase() as ShipSlot;
  return { slot, label: LABELS[slot] };
}

/** Cart /sepet + drawer: demo delivery time window, localStorage only. */
export function ShipSlotField() {
  const [info, setInfo] = useState<ShipSlotInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipSlot());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-slot", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-slot", sync);
    };
  }, []);

  function pick(slot: ShipSlot) {
    const next = { slot: info.slot === slot ? null : slot };
    writeShipSlot(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-slot-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat saati</span>
        {info.slot ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-slot-clear"
            onClick={() => {
              clearShipSlot();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat saati" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SLOTS.map((s) => (
          <button
            key={s}
            className={`chip ${info.slot === s ? "on" : ""}`}
            type="button"
            aria-pressed={info.slot === s}
            data-cta={`ship-slot-${s}`}
            onClick={() => pick(s)}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.slot
          ? `Seçilen · ${LABELS[info.slot]} · demo · checkout notuna yazılır · ikas&apos;a gitmez`
          : "İsteğe bağlı dilim · demo · ikas&apos;a gitmez"}
      </p>
    </div>
  );
}

export { SLOT_KEY, LABELS as SHIP_SLOT_LABELS };
