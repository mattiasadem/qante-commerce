"use client";
import { useEffect, useState } from "react";

const CONTACT_KEY = "qante_contact";

export type ContactChannel = "whatsapp" | "sms" | "email" | "ara";

export type ContactInfo = {
  channel: ContactChannel | null;
};

const LABELS: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "E-posta",
  ara: "Ara",
};

const CHANNELS: ContactChannel[] = ["whatsapp", "sms", "email", "ara"];

const EMPTY: ContactInfo = { channel: null };

export function readContact(): ContactInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(CONTACT_KEY) || "null") as Partial<ContactInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const c = raw.channel;
    if (c === "whatsapp" || c === "sms" || c === "email" || c === "ara") return { channel: c };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeContact(info: ContactInfo) {
  try {
    if (!info.channel) localStorage.removeItem(CONTACT_KEY);
    else localStorage.setItem(CONTACT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-contact"));
  } catch {
    /* ignore */
  }
}

export function clearContact() {
  writeContact({ ...EMPTY });
}

export function contactLabel(channel: ContactChannel | null | undefined): string | null {
  if (!channel) return null;
  return LABELS[channel] ?? null;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatContactTag(info: ContactInfo = readContact()): string | null {
  if (!info.channel) return null;
  return `[iletisim:${info.channel}]`;
}

export function parseContactFromNote(note?: string): { channel: ContactChannel; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[iletisim:(whatsapp|sms|email|ara)\]/i);
  if (!m) return null;
  const channel = m[1].toLowerCase() as ContactChannel;
  return { channel, label: LABELS[channel] };
}

/** Cart /sepet + drawer: demo contact preference, localStorage only. */
export function ContactField() {
  const [info, setInfo] = useState<ContactInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readContact());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-contact", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-contact", sync);
    };
  }, []);

  function pick(channel: ContactChannel) {
    const next = { channel: info.channel === channel ? null : channel };
    writeContact(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="contact-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">İletişim tercihi</span>
        {info.channel ? (
          <button
            className="chip"
            type="button"
            data-cta="contact-clear"
            onClick={() => {
              clearContact();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="İletişim tercihi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CHANNELS.map((c) => (
          <button
            key={c}
            className={`chip ${info.channel === c ? "on" : ""}`}
            type="button"
            aria-pressed={info.channel === c}
            data-cta={`contact-${c}`}
            onClick={() => pick(c)}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.channel
          ? `Seçilen · ${LABELS[info.channel]} · demo · checkout notuna yazılır · ikas'a gitmez`
          : "Sipariş güncellemesi için tercih · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { CONTACT_KEY, LABELS as CONTACT_LABELS };
