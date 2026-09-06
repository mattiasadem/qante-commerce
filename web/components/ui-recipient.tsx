"use client";
import { useEffect, useState } from "react";

const RECIPIENT_KEY = "qante_recipient";

export type RecipientInfo = {
  enabled: boolean;
  name: string;
  phone: string;
};

const EMPTY: RecipientInfo = { enabled: false, name: "", phone: "" };

function cleanPart(s: string, max: number): string {
  return s.replace(/[|\]]/g, "").slice(0, max);
}

export function readRecipient(): RecipientInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(RECIPIENT_KEY) || "null") as Partial<RecipientInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    return {
      enabled: Boolean(raw.enabled),
      name: typeof raw.name === "string" ? cleanPart(raw.name, 40) : "",
      phone: typeof raw.phone === "string" ? cleanPart(raw.phone, 20) : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeRecipient(info: RecipientInfo) {
  try {
    localStorage.setItem(RECIPIENT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-recipient"));
  } catch {
    /* ignore */
  }
}

export function clearRecipient() {
  try {
    localStorage.removeItem(RECIPIENT_KEY);
    window.dispatchEvent(new CustomEvent("qante-recipient"));
  } catch {
    /* ignore */
  }
}

/** Compact tag for order note (fits checkout note budget). */
export function formatRecipientTag(info: RecipientInfo = readRecipient()): string | null {
  if (!info.enabled) return null;
  const name = cleanPart(info.name.trim(), 40);
  if (!name) return null;
  const phone = cleanPart(info.phone.trim(), 20);
  return phone ? `[alici:${name}|${phone}]` : `[alici:${name}]`;
}

export function parseRecipientFromNote(note?: string): { name: string; phone: string; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[alici:([^\|\]]+)(?:\|([^\]]*))?\]/i);
  if (!m?.[1]) return null;
  const name = m[1].trim();
  const phone = (m[2] ?? "").trim();
  const label = phone ? `${name} · ${phone}` : name;
  return { name, phone, label };
}

/** Cart /sepet + drawer: different recipient (name + phone), localStorage only. */
export function RecipientField() {
  const [info, setInfo] = useState<RecipientInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readRecipient());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-recipient", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-recipient", sync);
    };
  }, []);

  function setEnabled(enabled: boolean) {
    const next = { ...info, enabled };
    writeRecipient(next);
    setInfo(next);
  }

  function setName(name: string) {
    const next = { ...info, name: cleanPart(name, 40), enabled: true };
    writeRecipient(next);
    setInfo(next);
  }

  function setPhone(phone: string) {
    const next = { ...info, phone: cleanPart(phone, 20), enabled: true };
    writeRecipient(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="recipient-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button
          className={`chip ${info.enabled ? "on" : ""}`}
          type="button"
          aria-pressed={info.enabled}
          data-cta="recipient-toggle"
          onClick={() => setEnabled(!info.enabled)}
        >
          Alıcı farklı{info.enabled ? " · açık" : ""}
        </button>
        {info.enabled ? (
          <button className="chip" type="button" data-cta="recipient-clear" onClick={() => { clearRecipient(); setInfo({ ...EMPTY }); }}>
            Kaldır
          </button>
        ) : null}
      </div>
      {info.enabled ? (
        <div style={{ marginTop: 8 }} data-cta="recipient-form">
          <label style={{ display: "block", marginBottom: 8 }}>
            <span className="faint" style={{ display: "block", marginBottom: 6 }}>
              Alıcı adı
            </span>
            <input
              className="search"
              value={info.name}
              placeholder="Ayşe Yılmaz"
              aria-label="Alıcı adı"
              data-cta="recipient-name"
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "block" }}>
            <span className="faint" style={{ display: "block", marginBottom: 6 }}>
              Telefon (isteğe bağlı)
            </span>
            <input
              className="search"
              value={info.phone}
              placeholder="05xx xxx xx xx"
              aria-label="Alıcı telefon"
              data-cta="recipient-phone"
              maxLength={20}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <p className="faint" style={{ marginTop: 6 }}>
            Paket başkasına gidecekse · demo · checkout notuna yazılır · ikas&apos;a gitmez
          </p>
        </div>
      ) : (
        <p className="faint" style={{ marginTop: 6 }}>
          Açınca alıcı adı + telefon · demo · ikas&apos;a gitmez
        </p>
      )}
    </div>
  );
}

export { RECIPIENT_KEY };
