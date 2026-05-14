from django.conf import settings
from django.db import models

from apps.masters.choices import (
    CapaStatusChoices,
    GapSourceChoices,
    GapStatusChoices,
    PriorityChoices,
)


class Gap(models.Model):
    project = models.ForeignKey("projects.AccreditationProject", on_delete=models.CASCADE, related_name="gaps")
    project_indicator = models.ForeignKey("indicators.ProjectIndicator", on_delete=models.CASCADE, related_name="gaps")
    project_evidence_requirement = models.ForeignKey("indicators.ProjectEvidenceRequirement", on_delete=models.CASCADE, null=True, blank=True, related_name="gaps")
    evidence_requirement = models.ForeignKey("indicators.EvidenceRequirement", on_delete=models.CASCADE, null=True, blank=True, related_name="gaps")
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    source = models.CharField(max_length=50, choices=GapSourceChoices.choices, default=GapSourceChoices.MANUAL)
    status = models.CharField(max_length=50, choices=GapStatusChoices.choices, default=GapStatusChoices.OPEN)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_gaps")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.project.name} - Gap: {self.title}"


class CAPA(models.Model):
    project = models.ForeignKey("projects.AccreditationProject", on_delete=models.CASCADE, related_name="capas")
    gap = models.ForeignKey(Gap, on_delete=models.CASCADE, related_name="capas")
    project_indicator = models.ForeignKey("indicators.ProjectIndicator", on_delete=models.CASCADE, related_name="capas")
    project_evidence_requirement = models.ForeignKey("indicators.ProjectEvidenceRequirement", on_delete=models.CASCADE, null=True, blank=True, related_name="capas")
    
    title = models.CharField(max_length=255)
    root_cause = models.TextField(blank=True)
    corrective_action = models.TextField(blank=True)
    preventive_action = models.TextField(blank=True)
    
    responsible_person = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_capas")
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=CapaStatusChoices.choices, default=CapaStatusChoices.OPEN)
    closure_notes = models.TextField(blank=True)
    closure_evidence = models.ForeignKey("evidence.EvidenceItem", on_delete=models.SET_NULL, null=True, blank=True, related_name="closure_capas")
    
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="submitted_capas")
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_capas")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="closed_capas")
    closed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_capas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CAPA"
        verbose_name_plural = "CAPAs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.project.name} - CAPA: {self.title}"
