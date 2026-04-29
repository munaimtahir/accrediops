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
    DOCUMENT_POLICY = "DOCUMENT_POLICY", "Document / Policy"
    RECORD_REGISTER = "RECORD_REGISTER", "Record / Register"
    PHYSICAL_FACILITY = "PHYSICAL_FACILITY", "Physical / Facility"
    LICENSE_CERTIFICATE = "LICENSE_CERTIFICATE", "License / Certificate"
    STAFF_TRAINING = "STAFF_TRAINING", "Staff / Training"
    PROCESS_WORKFLOW = "PROCESS_WORKFLOW", "Process / Workflow"
    AUDIT_QUALITY = "AUDIT_QUALITY", "Audit / Quality"
    MIXED_EVIDENCE = "MIXED_EVIDENCE", "Mixed Evidence"
    MANUAL_REVIEW = "MANUAL_REVIEW", "Manual Review Needed"


class AIAssistanceLevelChoices(models.TextChoices):
    FULL_AI = "FULL_AI", "Full AI"
    PARTIAL_AI = "PARTIAL_AI", "Partial AI"
    NO_AI = "NO_AI", "No AI"


class EvidenceFrequencyChoices(models.TextChoices):
    ONE_TIME = "ONE_TIME", "One-time"
    RECURRING = "RECURRING", "Recurring"
    EVENT_BASED = "EVENT_BASED", "Event-based"


class PrimaryActionRequiredChoices(models.TextChoices):
    GENERATE_DOCUMENT = "GENERATE_DOCUMENT", "Generate Document"
    COLLECT_RECORD = "COLLECT_RECORD", "Collect Record"
    UPLOAD_PHOTO = "UPLOAD_PHOTO", "Upload Photo"
    ARRANGE_PHYSICAL_COMPLIANCE = "ARRANGE_PHYSICAL_COMPLIANCE", "Arrange Physical Compliance"
    OBTAIN_CERTIFICATE = "OBTAIN_CERTIFICATE", "Obtain Certificate"
    TRAIN_STAFF = "TRAIN_STAFF", "Train Staff"
    MAINTAIN_LOG = "MAINTAIN_LOG", "Maintain Log"
    REVIEW_EXISTING_EVIDENCE = "REVIEW_EXISTING_EVIDENCE", "Review Existing Evidence"
    MANUAL_DECISION = "MANUAL_DECISION", "Manual Decision"


class ClassificationReviewStatusChoices(models.TextChoices):
    UNCLASSIFIED = "UNCLASSIFIED", "Unclassified"
    AI_SUGGESTED = "AI_SUGGESTED", "AI Suggested"
    HUMAN_REVIEWED = "HUMAN_REVIEWED", "Human Reviewed"
    MANUALLY_CHANGED = "MANUALLY_CHANGED", "Manually Changed"
    NEEDS_REVIEW = "NEEDS_REVIEW", "Needs Review"


class ClassificationConfidenceChoices(models.TextChoices):
    HIGH = "HIGH", "High"
    MEDIUM = "MEDIUM", "Medium"
    LOW = "LOW", "Low"


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


class EvidenceReusePolicyChoices(models.TextChoices):
    NONE = "NONE", "None"
    MANUAL_REVIEW = "MANUAL_REVIEW", "Manual Review"
    AUTO_ALLOWED = "AUTO_ALLOWED", "Auto Allowed"


class PhysicalLocationTypeChoices(models.TextChoices):
    BINDER = "BINDER", "Binder"
    CABINET = "CABINET", "Cabinet"
    ROOM = "ROOM", "Room"
    OTHER = "OTHER", "Other"
