"""In-process catalog and order cache.

TTL only. Webhook invalidation arrives in F1. This cache does not reimplement
ikas search; it cuts read amplification.
"""

from __future__ import annotations

import time
from typing import Any

CATALOG_TTL_SECONDS = 10 * 60
ORDER_TTL_SECONDS = 5 * 60


class _Entry:
    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, ttl: float) -> None:
        self.value = value
        self.expires_at = time.monotonic() + ttl


class CatalogCache:
    def __init__(
        self,
        *,
        catalog_ttl: float = CATALOG_TTL_SECONDS,
        order_ttl: float = ORDER_TTL_SECONDS,
    ) -> None:
        self._catalog_ttl = catalog_ttl
        self._order_ttl = order_ttl
        self._catalog: _Entry | None = None
        self._orders: _Entry | None = None

    def get_catalog(self) -> Any | None:
        return self._get(self._catalog)

    def set_catalog(self, value: Any) -> None:
        self._catalog = _Entry(value, self._catalog_ttl)

    def get_orders(self) -> Any | None:
        return self._get(self._orders)

    def set_orders(self, value: Any) -> None:
        self._orders = _Entry(value, self._order_ttl)

    def invalidate_catalog(self) -> None:
        self._catalog = None

    def invalidate_orders(self) -> None:
        self._orders = None

    def invalidate_all(self) -> None:
        self._catalog = None
        self._orders = None

    @staticmethod
    def _get(entry: _Entry | None) -> Any | None:
        if entry is None:
            return None
        if time.monotonic() >= entry.expires_at:
            return None
        return entry.value
