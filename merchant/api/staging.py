"""Staged-change ledger. stage_* never calls ikas. apply_change is gated."""

from __future__ import annotations

import os
import uuid
from datetime import UTC, datetime
from typing import Any, Literal

Status = Literal["staged", "approved", "applied", "discarded", "failed"]

WRITES_ENABLED_ENV = "IKAS_WRITES_ENABLED"


def writes_enabled() -> bool:
    return os.environ.get(WRITES_ENABLED_ENV, "false").lower() in {"1", "true", "yes"}


class StagingLedger:
    def __init__(self) -> None:
        self._rows: dict[str, dict[str, Any]] = {}

    def stage(
        self,
        kind: str,
        payload: dict[str, Any],
        *,
        session_id: str,
        operator_id: str = "agent",
    ) -> dict[str, Any]:
        row = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "operator_id": operator_id,
            "kind": kind,
            "payload": payload,
            "status": "staged",
            "created_at": datetime.now(UTC).isoformat(),
            "approved_by": None,
            "applied_at": None,
            "ikas_response": None,
            "error": None,
        }
        self._rows[row["id"]] = row
        return dict(row)

    def get(self, change_id: str) -> dict[str, Any] | None:
        row = self._rows.get(change_id)
        return dict(row) if row else None

    def list_pending(self) -> list[dict[str, Any]]:
        return [dict(r) for r in self._rows.values() if r["status"] in {"staged", "approved"}]

    def approve(self, change_id: str, *, operator_id: str) -> dict[str, Any]:
        row = self._rows[change_id]
        if row["status"] != "staged":
            raise ValueError("only staged changes can be approved")
        row["status"] = "approved"
        row["approved_by"] = operator_id
        return dict(row)

    def discard(self, change_id: str, *, operator_id: str, reason: str) -> dict[str, Any]:
        row = self._rows[change_id]
        if row["status"] not in {"staged", "approved"}:
            raise ValueError("change is not pending")
        row["status"] = "discarded"
        row["error"] = reason
        row["approved_by"] = operator_id
        return dict(row)

    def apply_change(self, change_id: str) -> dict[str, Any]:
        row = self._rows[change_id]
        if row["status"] != "approved":
            raise PermissionError("apply_change requires status == approved")
        if not writes_enabled():
            row["status"] = "failed"
            row["error"] = "IKAS_WRITES_ENABLED is false"
            return dict(row)
        # Live ikas mutation is F2. Never send a write in F0.
        row["status"] = "failed"
        row["error"] = "ikas mutations are not implemented in this phase"
        return dict(row)


LEDGER = StagingLedger()
