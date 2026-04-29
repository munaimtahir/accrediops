from django.core.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

from apps.masters.choices import IndicatorCommentTypeChoices, RoleChoices


def user_has_role(user, *roles: str) -> bool:
    return bool(user and getattr(user, "is_authenticated", False) and user.role in roles)


def ensure_authenticated_user(actor) -> None:
    if getattr(actor, "is_authenticated", False):
        return
    raise PermissionDenied("Authentication required.")


def is_admin(user) -> bool:
    return user_has_role(user, RoleChoices.ADMIN)


def can_admin_access(actor) -> bool:
    return is_admin(actor)


def ensure_admin_access(actor) -> None:
    if can_admin_access(actor):
        return
    raise PermissionDenied("Only ADMIN can perform this action.")


def can_admin_or_lead_access(actor) -> bool:
    return user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD)


def ensure_admin_or_lead_access(actor) -> None:
    if can_admin_or_lead_access(actor):
        return
    raise PermissionDenied("Only ADMIN or LEAD can perform this action.")


def can_project_owner_access(actor, project_indicator) -> bool:
    if can_admin_or_lead_access(actor):
        return True
    return project_indicator.owner_id == actor.id and user_has_role(actor, RoleChoices.OWNER)


def ensure_project_owner_access(actor, project_indicator) -> None:
    if can_project_owner_access(actor, project_indicator):
        return
    raise PermissionDenied("Only the assigned OWNER can perform this action.")


def can_project_reviewer_access(actor, project_indicator) -> bool:
    if user_has_role(actor, RoleChoices.ADMIN, RoleChoices.LEAD, RoleChoices.APPROVER):
        return True
    return project_indicator.reviewer_id == actor.id and user_has_role(actor, RoleChoices.REVIEWER)


def ensure_project_reviewer_access(actor, project_indicator) -> None:
    if can_project_reviewer_access(actor, project_indicator):
        return
    raise PermissionDenied("Only the assigned REVIEWER can perform this action.")


def can_project_approver_access(actor, project_indicator) -> bool:
    if can_admin_or_lead_access(actor):
        return True
    return project_indicator.approver_id == actor.id and user_has_role(actor, RoleChoices.APPROVER)


def ensure_project_approver_access(actor, project_indicator) -> None:
    if can_project_approver_access(actor, project_indicator):
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


class ExplicitAuthenticatedPermission(BasePermission):
    message = "Authentication required."

    def has_permission(self, request, view) -> bool:
        return bool(getattr(request.user, "is_authenticated", False))


class RolePermission(BasePermission):
    allowed_roles: tuple[str, ...] = ()
    message = "Permission denied."

    def has_permission(self, request, view) -> bool:
        return user_has_role(request.user, *self.allowed_roles)


class AdminOnlyPermission(RolePermission):
    allowed_roles = (RoleChoices.ADMIN,)
    message = "Only ADMIN can perform this action."


class AdminOrLeadPermission(RolePermission):
    allowed_roles = (RoleChoices.ADMIN, RoleChoices.LEAD)
    message = "Only ADMIN or LEAD can perform this action."
