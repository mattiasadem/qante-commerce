"""Storefront FastAPI host on port 8004."""

from __future__ import annotations

from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from merchant.api.local_store import get_store
from storefront.api.cart_store import CARTS

app = FastAPI(title="Qante Storefront API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BRAND = {
    "name": "Qante",
    "assistant_name": "Qante Asistan",
    "voice": "samimi, kısa, Türkçe",
    "tokens": {
        "bg": "#0b0b0b",
        "surface": "#171717",
        "text": "#f3f3f0",
        "muted": "#9a9a94",
        "accent": "#d8c7a6",
        "radius": "12px",
        "grain": "dark",
    },
    "logo": {"kind": "square_round_pip"},
}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/brand")
async def brand() -> dict:
    return BRAND


@app.get("/api/products")
async def products() -> dict:
    return {"products": get_store().products}


class CartIn(BaseModel):
    action: str = "add"
    product_id: str | None = None
    qty: int = 1


def _session(x_session_id: str | None) -> str:
    return x_session_id or "guest"


def _enrich(cart) -> dict:
    store = get_store()
    items = []
    subtotal = 0.0
    for item in cart.items:
        product = store.product_by_id(item.product_id)
        line = item.qty * float(product["price"]) if product else 0.0
        subtotal += line
        items.append(
            {
                "product_id": item.product_id,
                "qty": item.qty,
                "product": product,
                "line_total": round(line, 2),
            }
        )
    return {
        "session_id": cart.session_id,
        "items": items,
        "subtotal": round(subtotal, 2),
        "currency": "TRY",
    }


@app.get("/api/cart")
async def get_cart(x_session_id: str | None = Header(default=None)) -> dict:
    return _enrich(CARTS.get(_session(x_session_id)))


@app.post("/api/cart")
async def post_cart(body: CartIn, x_session_id: str | None = Header(default=None)) -> dict:
    sid = _session(x_session_id)
    if body.action == "clear":
        cart = CARTS.clear(sid)
    elif body.action == "remove" and body.product_id:
        cart = CARTS.remove(sid, body.product_id)
    elif body.action == "update" and body.product_id:
        cart = CARTS.update(sid, body.product_id, body.qty)
    elif body.product_id:
        cart = CARTS.add(sid, body.product_id, body.qty)
    else:
        cart = CARTS.get(sid)
    return _enrich(cart)


class ChatIn(BaseModel):
    message: str
    product_id: str | None = None


def _match_products(message: str, product_id: str | None) -> list[dict]:
    store = get_store()
    text = message.casefold()
    keyed = {
        "gömlek": ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
        "gomlek": ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
        "keten": ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
        "yün": ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
        "yun": ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
        "atkı": ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
        "atki": ["prod_yun_atki"],
        "vazo": ["prod_seramik_vazo", "prod_cam_surahi", "prod_ahsap_tepsi"],
        "ev": ["prod_seramik_vazo", "prod_ahsap_tepsi", "prod_cam_surahi"],
        "cüzdan": ["prod_deri_cuzdan"],
        "cuzdan": ["prod_deri_cuzdan"],
    }
    ids: list[str] = []
    if product_id:
        ids.append(product_id)
    for key, values in keyed.items():
        if key in text:
            ids.extend(values)
    if not ids:
        ids = ["prod_keten_gomlek", "prod_seramik_vazo", "prod_yun_kazak"]
    seen: set[str] = set()
    out: list[dict] = []
    for pid in ids:
        if pid in seen:
            continue
        seen.add(pid)
        product = store.product_by_id(pid)
        if product:
            out.append(product)
        if len(out) == 3:
            break
    return out


@app.post("/api/chat")
async def chat(body: ChatIn) -> dict:
    products = _match_products(body.message, body.product_id)
    names = ", ".join(p["name"] for p in products)
    if body.product_id:
        current = get_store().product_by_id(body.product_id)
        label = current["name"] if current else "Bu parça"
        stock = current["stock"] if current else 0
        text = f"{label} stokta {stock} adet. Yakın üç öneri: {names}."
    else:
        text = f"Katalogdan {names} uygun görünüyor. Stok ve fiyat kartlarda."
    return {
        "text": text,
        "ui": [{"type": "present_products", "products": products}],
        "suggestions": ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"],
    }
