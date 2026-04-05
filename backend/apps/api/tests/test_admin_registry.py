from django.contrib import admin
from django.test import TestCase

from apps.accounts.models import ClientProfile
from apps.ai_actions.models import GeneratedOutput
from apps.audit.models import AuditEvent
from apps.evidence.models import EvidenceItem
from apps.exports.models import PrintPackItem
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import Indicator, ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement


class AdminRegistryTest(TestCase):
    def test_contract_models_are_registered(self):
        for model in (
            AccreditationProject,
            Framework,
            Area,
            Standard,
            Indicator,
            ProjectIndicator,
            EvidenceItem,
            RecurringRequirement,
            RecurringEvidenceInstance,
            GeneratedOutput,
            AuditEvent,
            ClientProfile,
            PrintPackItem,
        ):
            self.assertIn(model, admin.site._registry)
