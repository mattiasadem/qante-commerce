"""Canned Admin API envelopes for tests. Field names inside `data` are ours,
not claimed ikas schema. See docs/IKAS_API_NOTES.md.
"""

from __future__ import annotations

from typing import Any

LIST_PRODUCT_ENVELOPE: dict[str, Any] = {
    "data": {
        "listProduct": {
            "__typename": "ProductList",
            "records": [
                {"id": "prod_keten_gomlek", "name": "Keten Gömlek"},
                {"id": "prod_yun_atki", "name": "Yün Atkı"},
            ],
        }
    }
}

LIST_ORDER_ENVELOPE: dict[str, Any] = {
    "data": {
        "listOrder": {
            "__typename": "OrderList",
            "records": [
                {
                    "id": "ord_0805",
                    "status": "fulfilled",
                    "total": 1890.00,
                }
            ],
        }
    }
}


def canned(op_name: str) -> dict[str, Any]:
    mapping = {
        "ListProduct": LIST_PRODUCT_ENVELOPE,
        "ListOrder": LIST_ORDER_ENVELOPE,
    }
    return mapping[op_name]
