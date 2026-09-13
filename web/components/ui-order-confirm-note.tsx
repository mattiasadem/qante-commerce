"use client";

/** Strip structured [tag:value] tokens; leftover freeform checkout text. */
export function parseFreeformNote(note?: string): string | null {
  if (!note) return null;
  const free = note.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  if (!free) return null;
  return free.slice(0, 160);
}

/** /siparis confirm: freeform buyer note after structured tags are parsed elsewhere. */
export function OrderConfirmNoteSummary({ note }: { note?: string }) {
  const free = parseFreeformNote(note);
  if (!free) return null;
  return (
    <p className="muted" data-cta="note-summary" style={{ marginTop: 6 }}>
      Sipariş notu · {free}
    </p>
  );
}
