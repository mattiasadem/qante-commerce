"use client";

/** Thin local ActivityLine matching web-shared blueprint (Turkish host copy). */
export function ActivityLine({ label }: { label?: string }) {
  if (!label) {
    return (
      <div className="activity-line" role="status" aria-label="Çalışıyor">
        <div className="ac-skeleton" style={{ height: 12, width: "62%", borderRadius: 6 }} />
        <div className="ac-skeleton" style={{ height: 12, width: "40%", borderRadius: 6, marginTop: 8 }} />
      </div>
    );
  }
  return (
    <div className="activity-line" role="status">
      <span className="activity-dot" aria-hidden />
      <span className="activity-label">{label}</span>
    </div>
  );
}
