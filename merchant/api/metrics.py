"""BusinessSnapshot and simple series from order records.

Period is last `period_days` versus the previous window of the same length.
Cancelled and pending_payment orders are excluded from revenue.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

ISTANBUL = ZoneInfo("Europe/Istanbul")
REVENUE_STATUSES = {"fulfilled", "shipped", "paid", "return_requested"}


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value).astimezone(ISTANBUL)


def _in_window(created: datetime, start: datetime, end: datetime) -> bool:
    return start <= created < end


def _window_stats(orders: list[dict[str, Any]], start: datetime, end: datetime) -> dict[str, float]:
    selected = [
        o
        for o in orders
        if _in_window(parse_dt(o["created_at"]), start, end) and o["status"] in REVENUE_STATUSES
    ]
    cancelled = [
        o
        for o in orders
        if _in_window(parse_dt(o["created_at"]), start, end) and o["status"] == "cancelled"
    ]
    all_in = [o for o in orders if _in_window(parse_dt(o["created_at"]), start, end)]
    revenue = round(sum(float(o["total"]) for o in selected), 2)
    order_count = len(selected)
    aov = round(revenue / order_count, 2) if order_count else 0.0
    denom = len(all_in) or 1
    cancel_rate = round(len(cancelled) / denom, 4)
    refunds = [o for o in all_in if o["status"] == "return_requested"]
    refund_rate = round(len(refunds) / denom, 4)
    return {
        "revenue": revenue,
        "order_count": order_count,
        "aov": aov,
        "cancel_rate": cancel_rate,
        "refund_rate": refund_rate,
    }


def _delta_pct(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return round(((current - previous) / previous) * 100.0, 1)


def compute_snapshot(
    orders: list[dict[str, Any]],
    *,
    now: datetime,
    period_days: int = 30,
) -> dict[str, Any]:
    end = now.astimezone(ISTANBUL)
    start = end - timedelta(days=period_days)
    prev_start = start - timedelta(days=period_days)
    current = _window_stats(orders, start, end)
    previous = _window_stats(orders, prev_start, start)
    return {
        "period_start": start.date().isoformat(),
        "period_end": end.date().isoformat(),
        "period_days": period_days,
        "revenue": current["revenue"],
        "order_count": int(current["order_count"]),
        "aov": current["aov"],
        "cancel_rate": current["cancel_rate"],
        "refund_rate": current["refund_rate"],
        "revenue_delta_pct": _delta_pct(current["revenue"], previous["revenue"]),
        "order_delta_pct": _delta_pct(current["order_count"], previous["order_count"]),
        "aov_delta_pct": _delta_pct(current["aov"], previous["aov"]),
        "previous": previous,
    }
