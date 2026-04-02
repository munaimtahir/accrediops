from django.core.exceptions import ValidationError

from apps.masters.choices import ProjectIndicatorStatusChoices


ALLOWED_TRANSITIONS = {
    ProjectIndicatorStatusChoices.NOT_STARTED: {
        ProjectIndicatorStatusChoices.IN_PROGRESS,
        ProjectIndicatorStatusChoices.BLOCKED,
    },
    ProjectIndicatorStatusChoices.IN_PROGRESS: {
        ProjectIndicatorStatusChoices.UNDER_REVIEW,
        ProjectIndicatorStatusChoices.BLOCKED,
    },
    ProjectIndicatorStatusChoices.UNDER_REVIEW: {
        ProjectIndicatorStatusChoices.IN_PROGRESS,
        ProjectIndicatorStatusChoices.MET,
        ProjectIndicatorStatusChoices.BLOCKED,
    },
    ProjectIndicatorStatusChoices.BLOCKED: {
        ProjectIndicatorStatusChoices.IN_PROGRESS,
        ProjectIndicatorStatusChoices.UNDER_REVIEW,
    },
    ProjectIndicatorStatusChoices.MET: {
        ProjectIndicatorStatusChoices.IN_PROGRESS,
    },
}


def validate_transition(from_status: str, to_status: str) -> None:
    allowed_statuses = ALLOWED_TRANSITIONS.get(from_status, set())
    if to_status not in allowed_statuses:
        raise ValidationError(
            f"Invalid workflow transition: {from_status} -> {to_status}.",
        )
