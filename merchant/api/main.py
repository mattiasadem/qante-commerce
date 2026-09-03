"""Merchant FastAPI host on port 8005. Local store when IKAS_LOCAL_STORE=1."""

from __future__ import annotations

import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from merchant.api.local_store import get_store
from merchant.api.metrics import ISTANBUL
from merchant.api.staging import LEDGER

app = FastAPI(title="Qante Merchant API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_local_store() -> None:
    flag = os.environ.get("IKAS_LOCAL_STORE", "1")
    if flag not in {"1", "true", "TRUE", "yes"}:
        raise HTTPException(status_code=503, detail="set IKAS_LOCAL_STORE=1 for F0")


def _now() -> datetime:
    return datetime.now(ISTANBUL)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/merchant/reads/snapshot")
async def snapshot() -> dict:
    _require_local_store()
    return get_store().snapshot(now=_now())


@app.get("/api/merchant/reads/alerts")
@app.get("/api/merchant/alerts")
async def alerts() -> dict:
    _require_local_store()
    return {"alerts": get_store().alerts(now=_now())}


@app.get("/api/merchant/reads/issues")
@app.get("/api/merchant/issues")
async def issues() -> dict:
    _require_local_store()
    return {"issues": get_store().issues(now=_now())}


class ChatIn(BaseModel):
    message: str
    session_id: str = "local"


@app.post("/api/merchant/chat")
async def chat(body: ChatIn) -> dict:
    _require_local_store()
    store = get_store()
    snap = store.snapshot(now=_now())
    alert_list = store.alerts(now=_now())
    names = ", ".join(a["product_name"] for a in alert_list[:3]) or "yok"
    text = (
        f"Son {snap['period_days']} günde ciro {snap['revenue']:.2f} TRY, "
        f"{snap['order_count']} sipariş, ortalama sepet {snap['aov']:.2f} TRY. "
        f"Dikkat: {names}."
    )
    return {"text": text, "snapshot": snap, "alerts": alert_list[:5], "session_id": body.session_id}


@app.get("/api/merchant/changes")
async def pending_changes() -> dict:
    return {"changes": LEDGER.list_pending()}
