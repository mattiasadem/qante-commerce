"""Inventory and order-issue alerts derived from seed/local store data."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from merchant.api.metrics import ISTANBUL, parse_dt

REVENUE_STATUSES = {"fulfilled", "shipped", "paid", "return_requested"}


def _last_sale_at(product_id: str, orders: list[dict[str, Any]]) -> datetime | None:
    latest: datetime | None = None
    for order in orders:
        if order["status"] not in REVENUE_STATUSES:
            continue
        if not any(item["product_id"] == product_id for item in order.get("items", [])):
            continue
        created = parse_dt(order["created_at"])
        if latest is None or created > latest:
            latest = created
    return latest


def _units_sold_30d(product_id: str, orders: list[dict[str, Any]], now: datetime) -> int:
    start = now - timedelta(days=30)
    total = 0
    for order in orders:
        if order["status"] not in REVENUE_STATUSES:
            continue
        created = parse_dt(order["created_at"])
        if created < start or created >= now:
            continue
        for item in order.get("items", []):
            if item["product_id"] == product_id:
                total += int(item["qty"])
    return total


def compute_alerts(
    products: list[dict[str, Any]],
    orders: list[dict[str, Any]],
    thresholds: dict[str, Any],
    *,
    now: datetime,
) -> list[dict[str, Any]]:
    now = now.astimezone(ISTANBUL)
    low_cover = float(thresholds.get("low_stock_days_cover", 7))
    low_abs = int(thresholds.get("low_stock_absolute", 5))
    slow_days = int(thresholds.get("slow_mover_no_sale_days", 45))
    alerts: list[dict[str, Any]] = []
    for product in products:
        pid = product["id"]
        stock = int(product["stock"])
        sold = _units_sold_30d(pid, orders, now)
        daily = sold / 30.0
        days_cover = None if daily <= 0 else round(stock / daily, 1)
        last_sale = _last_sale_at(pid, orders)
        days_without = None if last_sale is None else (now - last_sale).days

        if stock <= 0:
            alerts.append(
                {
                    "kind": "out_of_stock",
                    "product_id": pid,
                    "product_name": product["name"],
                    "stock": stock,
                    "days_cover": 0.0,
                    "days_without_sale": days_without,
                    "message": f"{product['name']} tükendi.",
                }
            )
            continue
        low = stock <= low_abs or (days_cover is not None and days_cover < low_cover)
        if low:
            alerts.append(
                {
                    "kind": "low_stock",
                    "product_id": pid,
                    "product_name": product["name"],
                    "stock": stock,
                    "days_cover": days_cover,
                    "days_without_sale": days_without,
                    "message": f"{product['name']} stok {stock} adet.",
                }
            )
        if days_without is not None and days_without > slow_days:
            alerts.append(
                {
                    "kind": "slow_mover",
                    "product_id": pid,
                    "product_name": product["name"],
                    "stock": stock,
                    "days_cover": days_cover,
                    "days_without_sale": days_without,
                    "message": f"{product['name']} {days_without} gündür satılmadı.",
                }
            )
    return alerts


def compute_order_issues(
    orders: list[dict[str, Any]],
    thresholds: dict[str, Any],
    *,
    now: datetime,
) -> list[dict[str, Any]]:
    now = now.astimezone(ISTANBUL)
    unshipped_h = float(thresholds.get("unshipped_hours", 48))
    pending_h = float(thresholds.get("pending_payment_hours", 24))
    issues: list[dict[str, Any]] = []
    for order in orders:
        created = parse_dt(order["created_at"])
        age_h = (now - created).total_seconds() / 3600.0
        status = order["status"]
        if status == "paid" and age_h > unshipped_h:
            issues.append(
                {
                    "kind": "unshipped",
                    "order_id": order["id"],
                    "status": status,
                    "age_hours": round(age_h, 1),
                    "total": order["total"],
                    "message": f"{order['id']} {int(age_h)} saattir kargoya verilmedi.",
                }
            )
        elif status == "pending_payment" and age_h > pending_h:
            issues.append(
                {
                    "kind": "pending_payment",
                    "order_id": order["id"],
                    "status": status,
                    "age_hours": round(age_h, 1),
                    "total": order["total"],
                    "message": f"{order['id']} ödemesi {int(age_h)} saattir bekliyor.",
                }
            )
        elif status == "return_requested":
            issues.append(
                {
                    "kind": "return_open",
                    "order_id": order["id"],
                    "status": status,
                    "age_hours": round(age_h, 1),
                    "total": order["total"],
                    "message": f"{order['id']} iade talebi açık.",
                }
            )
    return issues
