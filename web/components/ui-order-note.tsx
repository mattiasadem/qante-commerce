"use client";
import { useEffect, useState } from "react";

const NOTE_KEY = "qante_checkout_note";

export function OrderNoteField() {
  const [note, setNote] = useState("");
  useEffect(() => {
    try {
      setNote(sessionStorage.getItem(NOTE_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span className="faint" style={{ display: "block", marginBottom: 6 }}>Sipariş notu (isteğe bağlı)</span>
      <textarea
        className="search"
        rows={2}
        maxLength={240}
        value={note}
        placeholder="Kapıya bırak, zili çalma…"
        data-cta="order-note"
        aria-label="Sipariş notu"
        onChange={(e) => {
          const v = e.target.value.slice(0, 240);
          setNote(v);
          try {
            sessionStorage.setItem(NOTE_KEY, v);
          } catch {
            /* ignore */
          }
        }}
        style={{ width: "100%", resize: "vertical", minHeight: 56 }}
      />
    </label>
  );
}

export function readCheckoutNote(): string {
  try {
    return sessionStorage.getItem(NOTE_KEY) ?? "";
  } catch {
    return "";
  }
}

export { NOTE_KEY };
