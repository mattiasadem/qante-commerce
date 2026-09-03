"""In-process ikas stand-in loaded from merchant/data/seed.json."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from merchant.api.alerts import compute_alerts, compute_order_issues
from merchant.api.metrics import ISTANBUL, compute_snapshot

SEED_PATH = Path(__file__).resolve().parents[1] / "data" / "seed.json"
THRESHOLDS_PATH = Path(__file__).resolve().parents[1] / "data" / "alert_thresholds.json"


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


class LocalStore:
    def __init__(
        self,
        seed_path: Path | None = None,
        thresholds_path: Path | None = None,
    ) -> None:
        self._seed_path = seed_path or SEED_PATH
        self._thresholds_path = thresholds_path or THRESHOLDS_PATH
        payload = _load_json(self._seed_path)
        self.store = payload.get("store", {"name": "Qante", "currency": "TRY"})
        self.products: list[dict[str, Any]] = payload["products"]
        self.orders: list[dict[str, Any]] = payload["orders"]
        self.thresholds: dict[str, Any] = _load_json(self._thresholds_path)

    def product_by_id(self, product_id: str) -> dict[str, Any] | None:
        for product in self.products:
            if product["id"] == product_id:
                return product
        return None

    def snapshot(self, *, now: datetime | None = None) -> dict[str, Any]:
        clock = now or datetime.now(ISTANBUL)
        return compute_snapshot(self.orders, now=clock)

    def alerts(self, *, now: datetime | None = None) -> list[dict[str, Any]]:
        clock = now or datetime.now(ISTANBUL)
        return compute_alerts(self.products, self.orders, self.thresholds, now=clock)

    def issues(self, *, now: datetime | None = None) -> list[dict[str, Any]]:
        clock = now or datetime.now(ISTANBUL)
        return compute_order_issues(self.orders, self.thresholds, now=clock)


_STORE: LocalStore | None = None


def get_store() -> LocalStore:
    global _STORE
    if _STORE is None:
        _STORE = LocalStore()
    return _STORE
