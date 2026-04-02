from django.core.exceptions import PermissionDenied

from apps.masters.choices import IndicatorCommentTypeChoices, RoleChoices


def user_has_role(user, *roles: str) -> bool:
    return bool(user and getattr(user, "is_authenticated", False) and user.role in roles)


def is_admin(user) -> bool:
    return user_has_role(user, RoleChoices.ADMIN)


def ensure_admin_access(actor) -> None:
    if is_admin(actor):
        return
    raise PermissionDenied("Only ADMIN can perform this action.")


def ensure_admin_or_lead_access(actor) -> None:
    if user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD):
        return
    raise PermissionDenied("Only ADMIN or LEAD can perform this action.")


def ensure_project_owner_access(actor, project_indicator) -> None:
    if user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD):
        return
    if project_indicator.owner_id == actor.id and user_has_role(actor, RoleChoices.OWNER):
        return
    raise PermissionDenied("Only the assigned OWNER can perform this action.")


def ensure_project_reviewer_access(actor, project_indicator) -> None:
    if user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD, RoleChoices.APPROVER):
        return
    if project_indicator.reviewer_id == actor.id and user_has_role(actor, RoleChoices.REVIEWER):
        return
    raise PermissionDenied("Only the assigned REVIEWER can perform this action.")


def ensure_project_approver_access(actor, project_indicator) -> None:
    if user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD):
        return
    if project_indicator.approver_id == actor.id and user_has_role(actor, RoleChoices.APPROVER):
        return
    raise PermissionDenied("Only the assigned APPROVER can perform this action.")


def ensure_comment_permission(actor, project_indicator, comment_type: str) -> None:
    if comment_type == IndicatorCommentTypeChoices.WORKING:
        ensure_project_owner_access(actor, project_indicator)
        return
    if comment_type == IndicatorCommentTypeChoices.REVIEW:
        ensure_project_reviewer_access(actor, project_indicator)
        return
    if comment_type == IndicatorCommentTypeChoices.APPROVAL:
        ensure_project_approver_access(actor, project_indicator)
        return
    raise PermissionDenied("Unsupported comment type.")
