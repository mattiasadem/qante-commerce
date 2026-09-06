"use client";
import { useEffect, useState } from "react";

const GIFT_KEY = "qante_gift";

export type GiftInfo = {
  enabled: boolean;
  note: string;
};

const EMPTY: GiftInfo = { enabled: false, note: "" };

export function readGift(): GiftInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(GIFT_KEY) || "null") as Partial<GiftInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    return {
      enabled: Boolean(raw.enabled),
      note: typeof raw.note === "string" ? raw.note.slice(0, 80) : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeGift(info: GiftInfo) {
  try {
    localStorage.setItem(GIFT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-gift"));
  } catch {
    /* ignore */
  }
}

export function clearGift() {
  try {
    localStorage.removeItem(GIFT_KEY);
    window.dispatchEvent(new CustomEvent("qante-gift"));
  } catch {
    /* ignore */
  }
}

/** Compact tag for order note (fits checkout note budget). */
export function formatGiftTag(info: GiftInfo = readGift()): string | null {
  if (!info.enabled) return null;
  const note = info.note.trim();
  return note ? `[hediye:${note}]` : "[hediye]";
}

export function parseGiftFromNote(note?: string): { note: string } | null {
  if (!note) return null;
  const m = note.match(/\[hediye(?::([^\]]*))?\]/i);
  if (!m) return null;
  return { note: (m[1] ?? "").trim() };
}

/** Cart /sepet + drawer: demo gift wrap toggle, localStorage only. */
export function GiftField() {
  const [info, setInfo] = useState<GiftInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readGift());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-gift", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-gift", sync);
    };
  }, []);

  function setEnabled(enabled: boolean) {
    const next = { ...info, enabled };
    writeGift(next);
    setInfo(next);
  }

  function setNote(note: string) {
    const next = { ...info, note: note.slice(0, 80), enabled: true };
    writeGift(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="gift-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button
          className={`chip ${info.enabled ? "on" : ""}`}
          type="button"
          aria-pressed={info.enabled}
          data-cta="gift-toggle"
          onClick={() => setEnabled(!info.enabled)}
        >
          Hediye paketi{info.enabled ? " · açık" : ""}
        </button>
        {info.enabled ? (
          <button className="chip" type="button" data-cta="gift-clear" onClick={() => { clearGift(); setInfo({ ...EMPTY }); }}>
            Kaldır
          </button>
        ) : null}
      </div>
      {info.enabled ? (
        <label style={{ display: "block", marginTop: 8 }} data-cta="gift-note-form">
          <span className="faint" style={{ display: "block", marginBottom: 6 }}>
            Hediye notu (isteğe bağlı)
          </span>
          <input
            className="search"
            value={info.note}
            placeholder="İyi ki doğdun"
            aria-label="Hediye notu"
            data-cta="gift-note"
            maxLength={80}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%" }}
          />
          <p className="faint" style={{ marginTop: 6 }}>
            Demo hediye paketi · ücretsiz · checkout notuna yazılır · ikas&apos;a gitmez
          </p>
        </label>
      ) : (
        <p className="faint" style={{ marginTop: 6 }}>
          Açınca paket + isteğe bağlı not · demo · ikas&apos;a gitmez
        </p>
      )}
    </div>
  );
}

export { GIFT_KEY };
