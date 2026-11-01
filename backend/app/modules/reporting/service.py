"""WasteLink Bali — Reporting Domain Service.

Provides aggregate metrics, timezone-aware date range filtering (WITA),
and secure CSV export with formula injection sanitization.
"""

from __future__ import annotations

import csv
import io
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus, ServiceArea
from app.modules.funding.models import FundingProgram
from app.modules.marketplace.models import DeliveryRecord, MaterialBatch
from app.modules.points.models import LedgerEntry, LedgerEntryStatus, LedgerEntryType
from app.modules.reporting.schemas import (
    CategoryWeightMetric,
    OperationalSummaryReport,
    ServiceAreaMetric,
)
from app.modules.taxonomy.models import WasteCategory

WITA_TZ = ZoneInfo("Asia/Makassar")


def _sanitize_csv_cell(value: object) -> str:
    """Sanitize CSV cells against spreadsheet formula injection (=, +, -, @, tab, cr)."""
    text = str(value) if value is not None else ""
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{text}"
    return text


def get_operational_summary_report(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> OperationalSummaryReport:
    """Generate high-integrity operational metrics without mixing estimated and verified weights."""
    now_utc = datetime.now(UTC)

    # Base query filters
    pickup_filter = []
    if date_from:
        pickup_filter.append(PickupRequest.created_at >= date_from)
    if date_to:
        pickup_filter.append(PickupRequest.created_at <= date_to)

    # 1. Pickup counts by status
    status_counts_stmt = (
        select(PickupRequest.status, func.count(PickupRequest.id))
        .where(*pickup_filter)
        .group_by(PickupRequest.status)
    )
    status_counts: dict[str, int] = {
        str(row[0]): int(row[1]) for row in db.execute(status_counts_stmt).all()
    }

    total_pickups = sum(status_counts.values())
    pickups_submitted = status_counts.get(PickupStatus.SUBMITTED.value, 0)
    pickups_completed = status_counts.get(PickupStatus.COMPLETED.value, 0)
    pickups_cancelled = status_counts.get(PickupStatus.CANCELLED.value, 0) + status_counts.get(
        PickupStatus.REJECTED.value, 0
    )
    pickups_in_progress = total_pickups - pickups_submitted - pickups_completed - pickups_cancelled

    # 2. Weights: Estimated vs Verified (STRICTLY SEPARATED)
    est_weight_stmt = select(func.coalesce(func.sum(PickupRequest.estimated_weight_kg), 0.0)).where(
        *pickup_filter
    )
    total_est_weight = float(db.scalar(est_weight_stmt) or 0.0)

    ver_weight_stmt = select(func.coalesce(func.sum(PickupRequest.actual_weight_kg), 0.0)).where(
        PickupRequest.status == PickupStatus.COMPLETED.value, *pickup_filter
    )
    total_ver_weight = float(db.scalar(ver_weight_stmt) or 0.0)

    # 3. Batched, Dispatched, Received & Discrepancy
    batch_weight_stmt = select(func.coalesce(func.sum(MaterialBatch.total_weight_kg), 0.0))
    total_batched_weight = float(db.scalar(batch_weight_stmt) or 0.0)

    disp_stmt = select(
        func.coalesce(func.sum(DeliveryRecord.dispatched_weight_kg), 0.0),
        func.coalesce(func.sum(DeliveryRecord.received_weight_kg), 0.0),
        func.coalesce(func.sum(DeliveryRecord.weight_discrepancy_kg), 0.0),
    )
    disp_res = db.execute(disp_stmt).one()
    total_dispatched_weight = float(disp_res[0] or 0.0)
    total_received_weight = float(disp_res[1] or 0.0)
    total_weight_discrepancy = float(disp_res[2] or 0.0)

    # 4. WastePoints Ledger Totals
    pts_issued_stmt = select(func.coalesce(func.sum(LedgerEntry.points_delta), 0)).where(
        LedgerEntry.points_delta > 0,
        LedgerEntry.status == LedgerEntryStatus.POSTED.value,
    )
    total_points_issued = int(db.scalar(pts_issued_stmt) or 0)

    pts_rev_stmt = select(func.coalesce(func.sum(func.abs(LedgerEntry.points_delta)), 0)).where(
        LedgerEntry.entry_type == LedgerEntryType.REVERSAL.value,
        LedgerEntry.status == LedgerEntryStatus.POSTED.value,
    )
    total_points_reversed = int(db.scalar(pts_rev_stmt) or 0)

    net_points_stmt = select(func.coalesce(func.sum(LedgerEntry.points_delta), 0)).where(
        LedgerEntry.status == LedgerEntryStatus.POSTED.value,
    )
    net_points_in_circulation = int(db.scalar(net_points_stmt) or 0)

    # 5. Funding Program Metrics
    funding_stmt = select(
        func.coalesce(func.sum(FundingProgram.total_budget_idr), 0),
        func.coalesce(func.sum(FundingProgram.points_capacity), 0),
        func.coalesce(func.sum(FundingProgram.total_points_disbursed), 0),
    )
    f_res = db.execute(funding_stmt).one()
    funding_budget_total = int(f_res[0] or 0)
    funding_points_capacity = int(f_res[1] or 0)
    funding_points_disbursed = int(f_res[2] or 0)
    funding_remaining = max(0, funding_points_capacity - funding_points_disbursed)

    # 6. Category breakdown
    cat_stmt = (
        select(
            WasteCategory.id,
            WasteCategory.name,
            func.coalesce(func.sum(PickupRequest.actual_weight_kg), 0.0),
            func.count(PickupRequest.id),
        )
        .outerjoin(
            PickupRequest,
            (PickupRequest.category_id == WasteCategory.id)
            & (PickupRequest.status == PickupStatus.COMPLETED.value),
        )
        .group_by(WasteCategory.id, WasteCategory.name)
    )
    cat_rows = db.execute(cat_stmt).all()
    category_metrics = [
        CategoryWeightMetric(
            category_id=r[0],
            category_name=r[1],
            verified_weight_kg=round(float(r[2] if r[2] is not None else 0.0), 3),
            pickups_count=int(r[3]),
            points_issued=0,
        )
        for r in cat_rows
    ]

    # 7. Service area breakdown
    area_stmt = (
        select(
            ServiceArea.id,
            ServiceArea.name,
            func.count(PickupRequest.id),
            func.coalesce(func.sum(PickupRequest.actual_weight_kg), 0.0),
        )
        .outerjoin(
            PickupRequest,
            (PickupRequest.service_area_id == ServiceArea.id)
            & (PickupRequest.status == PickupStatus.COMPLETED.value),
        )
        .group_by(ServiceArea.id, ServiceArea.name)
    )
    area_rows = db.execute(area_stmt).all()
    area_metrics = [
        ServiceAreaMetric(
            service_area_id=r[0],
            area_name=r[1],
            pickups_count=int(r[2]),
            verified_weight_kg=round(float(r[3] if r[3] is not None else 0.0), 3),
        )
        for r in area_rows
    ]

    return OperationalSummaryReport(
        generated_at=now_utc,
        date_from=date_from,
        date_to=date_to,
        total_pickups=total_pickups,
        pickups_submitted=pickups_submitted,
        pickups_in_progress=pickups_in_progress,
        pickups_completed=pickups_completed,
        pickups_cancelled=pickups_cancelled,
        total_estimated_weight_kg=round(total_est_weight, 3),
        total_verified_weight_kg=round(total_ver_weight, 3),
        total_batched_weight_kg=round(total_batched_weight, 3),
        total_dispatched_weight_kg=round(total_dispatched_weight, 3),
        total_received_weight_kg=round(total_received_weight, 3),
        total_weight_discrepancy_kg=round(total_weight_discrepancy, 3),
        total_points_issued=total_points_issued,
        total_points_reversed=total_points_reversed,
        net_points_in_circulation=net_points_in_circulation,
        funding_budget_total_idr=funding_budget_total,
        funding_points_capacity=funding_points_capacity,
        funding_points_disbursed=funding_points_disbursed,
        funding_remaining_capacity=funding_remaining,
        category_metrics=category_metrics,
        area_metrics=area_metrics,
    )


def export_operational_metrics_csv(
    db: Session,
    admin: User,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    request_id: str | None = None,
) -> str:
    """Generate sanitized, anonymized CSV export for reporting and record audit log."""
    report = get_operational_summary_report(db, date_from, date_to)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header / Meta
    writer.writerow([_sanitize_csv_cell("WasteLink Bali — Laporan Metrik Operasional")])
    writer.writerow(
        [
            _sanitize_csv_cell("Waktu Ekspor (UTC)"),
            _sanitize_csv_cell(report.generated_at.isoformat()),
        ]
    )
    writer.writerow([_sanitize_csv_cell("Zona Waktu"), _sanitize_csv_cell(report.timezone)])
    writer.writerow([])

    # Section 1: Ringkasan Setoran & Berat
    writer.writerow([_sanitize_csv_cell("Metrik"), _sanitize_csv_cell("Nilai")])
    writer.writerow(
        [_sanitize_csv_cell("Total Setoran Dibuat"), _sanitize_csv_cell(report.total_pickups)]
    )
    writer.writerow(
        [_sanitize_csv_cell("Setoran Selesai"), _sanitize_csv_cell(report.pickups_completed)]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Setoran Dibatalkan/Ditolak"),
            _sanitize_csv_cell(report.pickups_cancelled),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Estimasi Berat (kg)"),
            _sanitize_csv_cell(report.total_estimated_weight_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Berat Tervalidasi (kg)"),
            _sanitize_csv_cell(report.total_verified_weight_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Berat Masuk Batch (kg)"),
            _sanitize_csv_cell(report.total_batched_weight_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Berat Dikirim (kg)"),
            _sanitize_csv_cell(report.total_dispatched_weight_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Berat Diterima Mitra (kg)"),
            _sanitize_csv_cell(report.total_received_weight_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Selisih Berat Timbangan (kg)"),
            _sanitize_csv_cell(report.total_weight_discrepancy_kg),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Poin Diterbitkan"),
            _sanitize_csv_cell(report.total_points_issued),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Total Poin Dibatalkan"),
            _sanitize_csv_cell(report.total_points_reversed),
        ]
    )
    writer.writerow(
        [
            _sanitize_csv_cell("Net Poin Beredar"),
            _sanitize_csv_cell(report.net_points_in_circulation),
        ]
    )
    writer.writerow([])

    # Section 2: Kategori Sampah
    writer.writerow(
        [
            _sanitize_csv_cell("Kategori ID"),
            _sanitize_csv_cell("Nama Kategori"),
            _sanitize_csv_cell("Berat Bersih (kg)"),
            _sanitize_csv_cell("Jumlah Setoran"),
        ]
    )
    for c in report.category_metrics:
        writer.writerow(
            [
                _sanitize_csv_cell(c.category_id),
                _sanitize_csv_cell(c.category_name),
                _sanitize_csv_cell(c.verified_weight_kg),
                _sanitize_csv_cell(c.pickups_count),
            ]
        )

    # Section 3: Wilayah Layanan (Banjar)
    writer.writerow([])
    writer.writerow(
        [
            _sanitize_csv_cell("Area ID"),
            _sanitize_csv_cell("Nama Banjar"),
            _sanitize_csv_cell("Jumlah Setoran"),
            _sanitize_csv_cell("Berat Bersih (kg)"),
        ]
    )
    for a in report.area_metrics:
        writer.writerow(
            [
                _sanitize_csv_cell(a.service_area_id),
                _sanitize_csv_cell(a.area_name),
                _sanitize_csv_cell(a.pickups_count),
                _sanitize_csv_cell(a.verified_weight_kg),
            ]
        )

    # Record Audit Log
    audit = AuditLog(
        action="OPERATIONAL_REPORT_EXPORTED",
        actor_id=admin.id,
        entity_type="REPORT",
        entity_id="OPERATIONAL_SUMMARY",
        request_id=request_id,
        reason="Ekspor data CSV laporan operasional banjar",
        payload_after={"format": "CSV", "total_pickups": report.total_pickups},
    )
    db.add(audit)
    db.commit()

    return output.getvalue()
