"""Guest cart store owned by this host (ADR-001 option B).

This is not an ikas cart API. Checkout later hands off a URL; F0 keeps the
cart in process memory keyed by session id.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from typing import Any


@dataclass
class CartItem:
    product_id: str
    qty: int


@dataclass
class Cart:
    session_id: str
    items: list[CartItem] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "items": [{"product_id": i.product_id, "qty": i.qty} for i in self.items],
        }


class CartStore:
    def __init__(self) -> None:
        self._carts: dict[str, Cart] = {}
        self._lock = Lock()

    def get(self, session_id: str) -> Cart:
        with self._lock:
            cart = self._carts.get(session_id)
            if cart is None:
                cart = Cart(session_id=session_id)
                self._carts[session_id] = cart
            return Cart(session_id=cart.session_id, items=list(cart.items))

    def add(self, session_id: str, product_id: str, qty: int = 1) -> Cart:
        if qty < 1:
            raise ValueError("qty must be >= 1")
        with self._lock:
            cart = self._carts.setdefault(session_id, Cart(session_id=session_id))
            for item in cart.items:
                if item.product_id == product_id:
                    item.qty += qty
                    break
            else:
                cart.items.append(CartItem(product_id=product_id, qty=qty))
            return Cart(session_id=cart.session_id, items=list(cart.items))

    def update(self, session_id: str, product_id: str, qty: int) -> Cart:
        with self._lock:
            cart = self._carts.setdefault(session_id, Cart(session_id=session_id))
            if qty <= 0:
                cart.items = [i for i in cart.items if i.product_id != product_id]
            else:
                for item in cart.items:
                    if item.product_id == product_id:
                        item.qty = qty
                        break
                else:
                    cart.items.append(CartItem(product_id=product_id, qty=qty))
            return Cart(session_id=cart.session_id, items=list(cart.items))

    def remove(self, session_id: str, product_id: str) -> Cart:
        return self.update(session_id, product_id, 0)

    def clear(self, session_id: str) -> Cart:
        with self._lock:
            cart = Cart(session_id=session_id)
            self._carts[session_id] = cart
            return Cart(session_id=session_id, items=[])


CARTS = CartStore()
