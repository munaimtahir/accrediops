from django.conf import settings
from django.db import models

from apps.masters.choices import DocumentTypeChoices


class DocumentDraft(models.Model):
    # Core linkage
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.CASCADE,
        related_name="document_drafts",
    )
    indicator = models.ForeignKey(
        "indicators.Indicator",
        on_delete=models.CASCADE,
        related_name="document_drafts",
    )
    project = models.ForeignKey(
        "projects.AccreditationProject",
        on_delete=models.CASCADE,
        related_name="document_drafts",
        null=True,
        blank=True,
    )
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="document_drafts",
        null=True,
        blank=True,
    )

    # Draft content and metadata
    title = models.CharField(max_length=500)
    document_type = models.CharField(
        max_length=20,
        choices=DocumentTypeChoices.choices,
        default=DocumentTypeChoices.OTHER,
    )
    draft_content = models.TextField()
    prompt_snapshot = models.JSONField(default=dict, blank=True)
    source = models.CharField(max_length=20, default="AI")  # AI / MANUAL / IMPORTED
    provider = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=100, blank=True)
    ai_usage_log = models.ForeignKey(
        "ai_actions.AIUsageLog",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="document_drafts",
    )

    # Versioning and history
    version = models.PositiveIntegerField(default=1)
    parent_draft = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revisions",
    )

    # Status and workflow
    review_status = models.CharField(
        max_length=30,
        choices=[
            ("DRAFT", "Draft"),
            ("HUMAN_REVIEW_REQUIRED", "Human Review Required"),
            ("HUMAN_REVIEWED", "Human Reviewed"),
            ("PROMOTED_TO_EVIDENCE", "Promoted to Evidence"),
            ("ARCHIVED", "Archived"),
        ],
        default="DRAFT",
    )
    is_advisory = models.BooleanField(default=True)  # Always true until promoted

    # Audit trail
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="generated_document_drafts",
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_document_drafts",
    )
    last_edited_at = models.DateTimeField(null=True, blank=True)
    promoted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="promoted_document_drafts",
    )
    promoted_at = models.DateTimeField(null=True, blank=True)
    promoted_evidence = models.ForeignKey(
        "evidence.EvidenceItem",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="source_document_drafts",
    )

    class Meta:
        ordering = ["-generated_at"]
        verbose_name = "Document Draft"
        verbose_name_plural = "Document Drafts"

    def clean(self):
        # Ensure framework-level drafts do not have project links
        if self.project is None and self.project_indicator is None:
            # This is a framework-level draft
            pass
        elif self.project is not None and self.project_indicator is not None:
            # This is a project-level draft
            # Ensure project-level drafts link to the correct framework/indicator through project_indicator
            if self.project != self.project_indicator.project:
                raise ValidationError("Project-level drafts must link to their project through the project indicator.")
            if self.framework != self.project_indicator.indicator.framework:
                raise ValidationError("Project-level drafts must link to their framework through the project indicator.")
            if self.indicator != self.project_indicator.indicator:
                raise ValidationError("Project-level drafts must link to their indicator through the project indicator.")
        else:
            # Invalid state: either project or project_indicator is null, but not both
            raise ValidationError("Document drafts must either be framework-level (no project/project_indicator) or project-level (both project and project_indicator linked).")

    def __str__(self) -> str:
        if self.project:
            return f"{self.project.name} / {self.indicator.code} / {self.title} v{self.version}"
        return f"{self.framework.name} / {self.indicator.code} / {self.title} v{self.version} (Framework)"
