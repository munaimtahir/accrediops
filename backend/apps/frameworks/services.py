import csv
import io
from collections import defaultdict

from django.core.exceptions import ValidationError
from django.db import transaction

from apps.audit.services import log_audit_event
from apps.exports.models import ImportLog
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import Indicator
from apps.masters.choices import (
    DocumentTypeChoices,
    EvidenceReusePolicyChoices,
    EvidenceTypeChoices,
    RecurrenceFrequencyChoices,
    RecurrenceModeChoices,
)

TEMPLATE_COLUMNS = [
    "area_code",
    "area_name",
    "area_description",
    "area_sort_order",
    "standard_code",
    "standard_name",
    "standard_description",
    "standard_sort_order",
    "indicator_code",
    "indicator_text",
    "required_evidence_description",
    "evidence_type",
    "document_type",
    "fulfillment_guidance",
    "is_recurring",
    "recurrence_frequency",
    "recurrence_mode",
    "minimum_required_evidence_count",
    "reusable_template_allowed",
    "evidence_reuse_policy",
    "is_active",
    "indicator_sort_order",
]

REQUIRED_TEMPLATE_COLUMNS = [
    "area_code",
    "area_name",
    "standard_code",
    "standard_name",
    "indicator_code",
    "indicator_text",
]


def _csv_from_rows(rows: list[dict]) -> str:
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=TEMPLATE_COLUMNS)
    writer.writeheader()
    for row in rows:
        writer.writerow({column: row.get(column, "") for column in TEMPLATE_COLUMNS})
    return stream.getvalue()


def framework_template_payload() -> dict:
    sample_row = {
        "area_code": "A100",
        "area_name": "Patient Safety",
        "area_description": "Core patient safety controls",
        "area_sort_order": 1,
        "standard_code": "S100",
        "standard_name": "Medication Governance",
        "standard_description": "Medication handling and review",
        "standard_sort_order": 1,
        "indicator_code": "IND-100",
        "indicator_text": "Evidence of medication safety governance",
        "required_evidence_description": "Policies, committee minutes, and logs",
        "evidence_type": "DOCUMENT_POLICY",
        "document_type": "POLICY",
        "fulfillment_guidance": "Maintain approved policy and review records.",
        "is_recurring": False,
        "recurrence_frequency": "NONE",
        "recurrence_mode": "EITHER",
        "minimum_required_evidence_count": 1,
        "reusable_template_allowed": False,
        "evidence_reuse_policy": "NONE",
        "is_active": True,
        "indicator_sort_order": 1,
    }
    return {
        "version": "1.0",
        "columns": TEMPLATE_COLUMNS,
        "required_columns": REQUIRED_TEMPLATE_COLUMNS,
        "sample_rows": [sample_row],
        "template_csv": _csv_from_rows([sample_row]),
    }


def parse_framework_csv(csv_text: str) -> list[dict]:
    if not csv_text or not csv_text.strip():
        raise ValidationError({"csv_text": ["Checklist file is empty."]})

    reader = csv.DictReader(io.StringIO(csv_text))
    if not reader.fieldnames:
        raise ValidationError({"csv_text": ["Checklist CSV header is missing."]})

    missing_headers = [column for column in REQUIRED_TEMPLATE_COLUMNS if column not in reader.fieldnames]
    if missing_headers:
        raise ValidationError(
            {
                "csv_text": [f"Checklist CSV is missing required columns: {', '.join(missing_headers)}."],
                "missing_headers": missing_headers,
            }
        )

    rows = []
    for row in reader:
        normalized = {key: (value.strip() if isinstance(value, str) else value) for key, value in row.items()}
        if any(normalized.get(column) for column in REQUIRED_TEMPLATE_COLUMNS):
            rows.append(normalized)

    if not rows:
        raise ValidationError({"csv_text": ["Checklist CSV does not contain any data rows."]})
    return rows


def _normalize_boolean(value, *, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if value is None or value == "":
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def _normalize_integer(value, *, default: int, minimum: int = 0) -> int:
    if value is None or value == "":
        return default
    try:
        parsed = int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f"Expected integer but got '{value}'.") from exc
    if parsed < minimum:
        raise ValidationError(f"Value must be >= {minimum}.")
    return parsed


def _normalize_choice(value, *, allowed: set[str], default: str) -> str:
    if value is None or value == "":
        return default
    parsed = str(value).strip().upper()
    if parsed not in allowed:
        raise ValidationError(f"Invalid choice '{value}'. Allowed: {', '.join(sorted(allowed))}.")
    return parsed


def validate_framework_rows(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    normalized_rows: list[dict] = []
    errors: list[dict] = []
    seen_indicator_codes: set[str] = set()
    area_names_by_code: dict[str, str] = {}
    standard_area_by_code: dict[str, str] = {}
    base_required_fields = [
        "area_code",
        "standard_code",
        "indicator_code",
        "indicator_text",
    ]

    allowed_evidence_type = {choice for choice, _ in EvidenceTypeChoices.choices}
    allowed_document_type = {choice for choice, _ in DocumentTypeChoices.choices}
    allowed_recurrence_frequency = {choice for choice, _ in RecurrenceFrequencyChoices.choices}
    allowed_recurrence_mode = {choice for choice, _ in RecurrenceModeChoices.choices}
    allowed_reuse_policy = {choice for choice, _ in EvidenceReusePolicyChoices.choices}

    for index, row in enumerate(rows, start=1):
        missing = [column for column in base_required_fields if not row.get(column)]
        if missing:
            errors.append(
                {
                    "row": index,
                    "error": "missing_fields",
                    "fields": missing,
                }
            )
            continue

        area_code = str(row.get("area_code")).strip()
        area_name = str(row.get("area_name") or row.get("area_code") or "").strip()
        standard_code = str(row.get("standard_code")).strip()
        standard_name = str(row.get("standard_name") or row.get("standard_code") or "").strip()
        indicator_code = str(row.get("indicator_code")).strip()
        indicator_text = str(row.get("indicator_text")).strip()

        if indicator_code in seen_indicator_codes:
            errors.append(
                {
                    "row": index,
                    "error": "duplicate_indicator_code",
                    "indicator_code": indicator_code,
                }
            )
            continue
        seen_indicator_codes.add(indicator_code)

        if area_code in area_names_by_code and area_names_by_code[area_code] != area_name:
            errors.append(
                {
                    "row": index,
                    "error": "area_code_name_conflict",
                    "area_code": area_code,
                }
            )
            continue
        area_names_by_code[area_code] = area_name

        if standard_code in standard_area_by_code and standard_area_by_code[standard_code] != area_code:
            errors.append(
                {
                    "row": index,
                    "error": "standard_code_area_conflict",
                    "standard_code": standard_code,
                }
            )
            continue
        standard_area_by_code[standard_code] = area_code

        try:
            is_recurring = _normalize_boolean(row.get("is_recurring"), default=False)
            recurrence_frequency = _normalize_choice(
                row.get("recurrence_frequency"),
                allowed=allowed_recurrence_frequency,
                default=RecurrenceFrequencyChoices.NONE,
            )
            recurrence_mode = _normalize_choice(
                row.get("recurrence_mode"),
                allowed=allowed_recurrence_mode,
                default=RecurrenceModeChoices.EITHER,
            )
            if is_recurring and recurrence_frequency == RecurrenceFrequencyChoices.NONE:
                recurrence_frequency = RecurrenceFrequencyChoices.DAILY
            if not is_recurring:
                recurrence_frequency = RecurrenceFrequencyChoices.NONE

            normalized_rows.append(
                {
                    "area_code": area_code,
                    "area_name": area_name,
                    "area_description": (row.get("area_description") or "").strip(),
                    "area_sort_order": _normalize_integer(row.get("area_sort_order"), default=0, minimum=0),
                    "standard_code": standard_code,
                    "standard_name": standard_name,
                    "standard_description": (row.get("standard_description") or "").strip(),
                    "standard_sort_order": _normalize_integer(row.get("standard_sort_order"), default=0, minimum=0),
                    "indicator_code": indicator_code,
                    "indicator_text": indicator_text,
                    "required_evidence_description": (row.get("required_evidence_description") or "").strip(),
                    "evidence_type": _normalize_choice(
                        row.get("evidence_type"),
                        allowed=allowed_evidence_type,
                        default=EvidenceTypeChoices.DOCUMENT_POLICY,
                    ),
                    "document_type": _normalize_choice(
                        row.get("document_type"),
                        allowed=allowed_document_type,
                        default=DocumentTypeChoices.OTHER,
                    ),
                    "fulfillment_guidance": (row.get("fulfillment_guidance") or "").strip(),
                    "is_recurring": is_recurring,
                    "recurrence_frequency": recurrence_frequency,
                    "recurrence_mode": recurrence_mode,
                    "minimum_required_evidence_count": _normalize_integer(
                        row.get("minimum_required_evidence_count"),
                        default=1,
                        minimum=1,
                    ),
                    "reusable_template_allowed": _normalize_boolean(
                        row.get("reusable_template_allowed"),
                        default=False,
                    ),
                    "evidence_reuse_policy": _normalize_choice(
                        row.get("evidence_reuse_policy"),
                        allowed=allowed_reuse_policy,
                        default=EvidenceReusePolicyChoices.NONE,
                    ),
                    "is_active": _normalize_boolean(row.get("is_active"), default=True),
                    "indicator_sort_order": _normalize_integer(row.get("indicator_sort_order"), default=0, minimum=0),
                }
            )
        except ValidationError as exc:
            errors.append(
                {
                    "row": index,
                    "error": "invalid_value",
                    "details": "; ".join(exc.messages),
                }
            )

    return normalized_rows, errors


@transaction.atomic
def import_framework_checklist(
    *,
    actor,
    framework: Framework,
    file_name: str,
    rows: list[dict],
) -> dict:
    normalized_rows, errors = validate_framework_rows(rows)
    if errors:
        ImportLog.objects.create(file_name=file_name, rows_processed=len(rows), errors=errors)
        raise ValidationError({"rows": errors})

    area_by_code: dict[str, Area] = {}
    standard_by_code: dict[str, Standard] = {}
    
    # Load existing areas and standards if they exist
    for area in framework.areas.all():
        area_by_code[area.code] = area
    for standard in framework.standards.all():
        standard_by_code[standard.code] = standard

    area_order_counter = len(area_by_code) + 1
    standard_order_counter_by_area: dict[str, int] = defaultdict(lambda: 1)
    for code, standard in standard_by_code.items():
        standard_order_counter_by_area[standard.area.code] = max(
            standard_order_counter_by_area[standard.area.code],
            standard.sort_order + 1
        )

    for row in normalized_rows:
        area = area_by_code.get(row["area_code"])
        if area is None:
            area_sort_order = row["area_sort_order"] or area_order_counter
            area = Area.objects.create(
                framework=framework,
                code=row["area_code"],
                name=row["area_name"],
                description=row["area_description"],
                sort_order=area_sort_order,
            )
            area_by_code[row["area_code"]] = area
            area_order_counter += 1

        standard = standard_by_code.get(row["standard_code"])
        if standard is None:
            default_standard_order = standard_order_counter_by_area[row["area_code"]]
            standard_sort_order = row["standard_sort_order"] or default_standard_order
            standard = Standard.objects.create(
                framework=framework,
                area=area,
                code=row["standard_code"],
                name=row["standard_name"],
                description=row["standard_description"],
                sort_order=standard_sort_order,
            )
            standard_by_code[row["standard_code"]] = standard
            standard_order_counter_by_area[row["area_code"]] += 1

        Indicator.objects.update_or_create(
            framework=framework,
            code=row["indicator_code"],
            defaults={
                "area": area,
                "standard": standard,
                "text": row["indicator_text"],
                "required_evidence_description": row["required_evidence_description"],
                "evidence_type": row["evidence_type"],
                "document_type": row["document_type"],
                "fulfillment_guidance": row["fulfillment_guidance"],
                "is_recurring": row["is_recurring"],
                "recurrence_frequency": row["recurrence_frequency"],
                "recurrence_mode": row["recurrence_mode"],
                "minimum_required_evidence_count": row["minimum_required_evidence_count"],
                "reusable_template_allowed": row["reusable_template_allowed"],
                "evidence_reuse_policy": row["evidence_reuse_policy"],
                "is_active": row["is_active"],
                "sort_order": row["indicator_sort_order"],
            }
        )

    ImportLog.objects.create(file_name=file_name, rows_processed=len(normalized_rows), errors=[])
    log_audit_event(
        actor=actor,
        event_type="framework.imported",
        obj=framework,
        before=None,
        after={
            "areas_count": len(area_by_code),
            "standards_count": len(standard_by_code),
            "indicators_count": len(normalized_rows),
            "rows_processed": len(normalized_rows),
            "file_name": file_name,
        },
    )
    return {
        "framework_id": framework.id,
        "framework_name": framework.name,
        "areas_count": len(area_by_code),
        "standards_count": len(standard_by_code),
        "indicators_count": len(normalized_rows),
        "rows_processed": len(normalized_rows),
        "errors": [],
    }


def framework_export_payload(framework: Framework) -> dict:
    rows = []
    indicators = (
        Indicator.objects.filter(framework=framework)
        .select_related("area", "standard")
        .order_by("area__sort_order", "standard__sort_order", "sort_order", "code")
    )
    for indicator in indicators:
        rows.append(
            {
                "area_code": indicator.area.code,
                "area_name": indicator.area.name,
                "area_description": indicator.area.description,
                "area_sort_order": indicator.area.sort_order,
                "standard_code": indicator.standard.code,
                "standard_name": indicator.standard.name,
                "standard_description": indicator.standard.description,
                "standard_sort_order": indicator.standard.sort_order,
                "indicator_code": indicator.code,
                "indicator_text": indicator.text,
                "required_evidence_description": indicator.required_evidence_description,
                "evidence_type": indicator.evidence_type,
                "document_type": indicator.document_type,
                "fulfillment_guidance": indicator.fulfillment_guidance,
                "is_recurring": indicator.is_recurring,
                "recurrence_frequency": indicator.recurrence_frequency,
                "recurrence_mode": indicator.recurrence_mode,
                "minimum_required_evidence_count": indicator.minimum_required_evidence_count,
                "reusable_template_allowed": indicator.reusable_template_allowed,
                "evidence_reuse_policy": indicator.evidence_reuse_policy,
                "is_active": indicator.is_active,
                "indicator_sort_order": indicator.sort_order,
            }
        )
    return {
        "framework": {
            "id": framework.id,
            "name": framework.name,
            "description": framework.description,
        },
        "columns": TEMPLATE_COLUMNS,
        "rows": rows,
        "row_count": len(rows),
        "export_csv": _csv_from_rows(rows),
    }
