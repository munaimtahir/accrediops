from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import Department, User
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import Indicator, ProjectIndicator
from apps.masters.choices import RecurrenceFrequencyChoices, RecurrenceModeChoices
from apps.projects.models import AccreditationProject
from apps.projects.services import initialize_project_from_framework


class ContractBaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.department = Department.objects.create(name="Quality")
        self.admin = User.objects.create_user(
            username="admin_user",
            password="x",
            role="ADMIN",
            department=self.department,
            is_staff=True,
            is_superuser=True,
        )
        self.lead = User.objects.create_user(
            username="lead_user",
            password="x",
            role="LEAD",
            department=self.department,
        )
        self.owner = User.objects.create_user(
            username="owner_user",
            password="x",
            role="OWNER",
            department=self.department,
        )
        self.reviewer = User.objects.create_user(
            username="reviewer_user",
            password="x",
            role="REVIEWER",
            department=self.department,
        )
        self.approver = User.objects.create_user(
            username="approver_user",
            password="x",
            role="APPROVER",
            department=self.department,
        )
        self.framework = Framework.objects.create(
            name="Hospital Accreditation",
            description="Internal governance framework",
        )
        self.area = Area.objects.create(
            framework=self.framework,
            code="A1",
            name="Patient Safety",
            sort_order=1,
        )
        self.standard = Standard.objects.create(
            framework=self.framework,
            area=self.area,
            code="S1",
            name="Medication Governance",
            sort_order=1,
        )
        self.indicator = Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-001",
            text="Evidence of medication safety governance",
            required_evidence_description="Policy and review records",
            evidence_type="DOCUMENT_POLICY",
            document_type="POLICY",
            fulfillment_guidance="Maintain approved documents.",
            minimum_required_evidence_count=1,
            sort_order=1,
        )
        self.recurring_indicator = Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-002",
            text="Daily temperature log review",
            required_evidence_description="Daily log",
            evidence_type="RECORD_REGISTER",
            document_type="REPORT",
            fulfillment_guidance="Upload or record the daily review.",
            is_recurring=True,
            recurrence_frequency=RecurrenceFrequencyChoices.DAILY,
            recurrence_mode=RecurrenceModeChoices.EITHER,
            minimum_required_evidence_count=1,
            sort_order=2,
        )
        today = timezone.localdate()
        self.project = AccreditationProject.objects.create(
            name="Client Alpha Accreditation",
            client_name="Client Alpha",
            accrediting_body_name="National Board",
            framework=self.framework,
            start_date=today - timedelta(days=1),
            target_date=today,
            created_by=self.admin,
        )

    def initialize_project(self):
        initialize_project_from_framework(project=self.project, actor=self.admin)
        return {
            item.indicator.code: item
            for item in ProjectIndicator.objects.filter(project=self.project).select_related("indicator")
        }
