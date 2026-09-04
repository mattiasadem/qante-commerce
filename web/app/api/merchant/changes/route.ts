import { NextResponse } from "next/server";
import { mergeStaged, type LedgerEntry, type StagedChange } from "@/lib/core";

export const dynamic = "force-dynamic";
const LEDGER = "qante_ledger";
const EXTRA = "qante_extra_staged";

function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
function parseLedger(raw?: string): Record<string, LedgerEntry> {
  if (!raw) return {};
  try { const d = JSON.parse(raw) as Record<string, LedgerEntry>; return d && typeof d === "object" ? d : {}; } catch { return {}; }
}
function parseExtras(raw?: string): StagedChange[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as StagedChange[];
    return Array.isArray(d) ? d.filter((c) => c && c.id && c.kind && c.product_id) : [];
  } catch { return []; }
}
function setCookies(res: NextResponse, pairs: { name: string; value: string }[]) {
  for (const p of pairs) res.cookies.set(p.name, p.value, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string; ids?: string[]; action?: string; reason?: string };
  const ledger = parseLedger(cookie(req, LEDGER));
  const extras = parseExtras(cookie(req, EXTRA));
  const now = new Date().toISOString();

  if (body.action === "approve_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
    const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
    if (!targets.length) return NextResponse.json({ error: "nothing to approve" }, { status: 400 });
    for (const c of targets) ledger[c.id] = { status: "applied", decided_at: now };
    const merged = mergeStaged(ledger, extras);
    const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

  if (body.action === "discard_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const note = (body.reason ?? "").trim();
    if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
    const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
    const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
    if (!targets.length) return NextResponse.json({ error: "nothing to discard" }, { status: 400 });
    for (const c of targets) ledger[c.id] = { status: "discarded", decision_note: note, decided_at: now };
    const merged = mergeStaged(ledger, extras);
    const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

  if (body.action === "restage_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const history = mergeStaged(ledger, extras).filter((c) => c.status === "applied" || c.status === "discarded");
    const targets = wanted.length ? history.filter((c) => wanted.includes(c.id)) : history;
    if (!targets.length) return NextResponse.json({ error: "nothing to restage" }, { status: 400 });
    for (const c of targets) ledger[c.id] = { status: "staged", decided_at: now };
    const merged = mergeStaged(ledger, extras);
    const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

  const id = body.id ?? "";
  const current = mergeStaged(ledger, extras).find((c) => c.id === id);
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (body.action === "discard") {
    const note = (body.reason ?? "").trim();
    if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
    ledger[id] = { status: "discarded", decision_note: note, decided_at: now };
  } else if (body.action === "approve") {
    ledger[id] = { status: "applied", decided_at: now };
  } else if (body.action === "restage") {
    if (current.status === "staged") return NextResponse.json({ error: "already staged" }, { status: 400 });
    ledger[id] = { status: "staged", decided_at: now };
  } else return NextResponse.json({ error: "bad action" }, { status: 400 });
  const change = mergeStaged(ledger, extras).find((c) => c.id === id);
  const res = NextResponse.json({ change, demo: true, ikas_written: false });
  return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
}
