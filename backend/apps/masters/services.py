from apps.masters.models import MasterValue

MASTER_KEYS = {
    "statuses",
    "priorities",
    "evidence-types",
    "document-types",
}


def list_master_values(key: str):
    return MasterValue.objects.filter(key=key).order_by("sort_order", "code")


def ensure_master_key(key: str) -> None:
    if key not in MASTER_KEYS:
        raise ValueError("Unsupported master key.")
