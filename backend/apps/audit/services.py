from datetime import date, datetime
from decimal import Decimal

from django.forms.models import model_to_dict

from apps.audit.models import AuditEvent


def normalize_for_json(value):
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, dict):
        return {key: normalize_for_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [normalize_for_json(item) for item in value]
    return value


def snapshot_instance(instance):
    if instance is None:
        return None
    data = model_to_dict(instance)
    return normalize_for_json(data)


def log_audit_event(*, actor, event_type: str, obj, before=None, after=None, reason: str | None = None) -> AuditEvent:
    return AuditEvent.objects.create(
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        event_type=event_type,
        object_type=obj.__class__.__name__,
        object_id=str(obj.pk),
        before_json=normalize_for_json(before),
        after_json=normalize_for_json(after),
        reason=reason,
    )
