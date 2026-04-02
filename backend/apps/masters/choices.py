from django.db import models


class RoleChoices(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    LEAD = "LEAD", "Lead"
    OWNER = "OWNER", "Owner"
    REVIEWER = "REVIEWER", "Reviewer"
    APPROVER = "APPROVER", "Approver"


class ProjectStatusChoices(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    COMPLETED = "COMPLETED", "Completed"
    ARCHIVED = "ARCHIVED", "Archived"


class ProjectIndicatorStatusChoices(models.TextChoices):
    NOT_STARTED = "NOT_STARTED", "Not Started"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    MET = "MET", "Met"
    BLOCKED = "BLOCKED", "Blocked"


class IndicatorCommentTypeChoices(models.TextChoices):
    WORKING = "WORKING", "Working"
    REVIEW = "REVIEW", "Review"
    APPROVAL = "APPROVAL", "Approval"


class RecurrenceFrequencyChoices(models.TextChoices):
    NONE = "NONE", "None"
    DAILY = "DAILY", "Daily"
    WEEKLY = "WEEKLY", "Weekly"
    MONTHLY = "MONTHLY", "Monthly"
    YEARLY = "YEARLY", "Yearly"


class RecurrenceModeChoices(models.TextChoices):
    DIGITAL = "DIGITAL", "Digital"
    UPLOAD = "UPLOAD", "Upload"
    EITHER = "EITHER", "Either"


class GeneratedOutputTypeChoices(models.TextChoices):
    GUIDANCE = "GUIDANCE", "Guidance"
    DRAFT = "DRAFT", "Draft"
    ASSESSMENT = "ASSESSMENT", "Assessment"


class PriorityChoices(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    CRITICAL = "CRITICAL", "Critical"


class EvidenceTypeChoices(models.TextChoices):
    DOCUMENT = "DOCUMENT", "Document"
    POLICY = "POLICY", "Policy"
    REPORT = "REPORT", "Report"
    IMAGE = "IMAGE", "Image"
    URL = "URL", "URL"
    OTHER = "OTHER", "Other"


class EvidenceSourceTypeChoices(models.TextChoices):
    UPLOAD = "UPLOAD", "Upload"
    URL = "URL", "URL"
    TEXT_NOTE = "TEXT_NOTE", "Text Note"
    GENERATED = "GENERATED", "Generated"
    EXTERNAL_REF = "EXTERNAL_REF", "External Reference"


class EvidenceValidityStatusChoices(models.TextChoices):
    UNKNOWN = "UNKNOWN", "Unknown"
    VALID = "VALID", "Valid"
    INVALID = "INVALID", "Invalid"


class EvidenceCompletenessStatusChoices(models.TextChoices):
    UNKNOWN = "UNKNOWN", "Unknown"
    COMPLETE = "COMPLETE", "Complete"
    INCOMPLETE = "INCOMPLETE", "Incomplete"


class EvidenceApprovalStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class RecurringInstanceStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending"
    SUBMITTED = "SUBMITTED", "Submitted"
    APPROVED = "APPROVED", "Approved"
    MISSED = "MISSED", "Missed"


class DocumentTypeChoices(models.TextChoices):
    SOP = "SOP", "SOP"
    POLICY = "POLICY", "Policy"
    FORM = "FORM", "Form"
    MINUTES = "MINUTES", "Minutes"
    REPORT = "REPORT", "Report"
    OTHER = "OTHER", "Other"
