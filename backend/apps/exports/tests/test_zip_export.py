import os
import zipfile
from pathlib import Path
from unittest.mock import patch, MagicMock

from django.conf import settings
from django.urls import reverse
from rest_framework import status

from apps.api.tests.base import ContractBaseTestCase
from apps.exports.services import build_final_zip_export, export_eligibility_report
from apps.evidence.models import EvidenceItem
from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    ProjectEvidenceRequirementStatusChoices,
    PriorityChoices,
    GapSourceChoices,
    CapaStatusChoices,
)
from apps.indicators.models import ProjectEvidenceRequirement, EvidenceRequirement, Indicator
from apps.accounts.models import User




class ZipExportTest(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = User.objects.create_user(username="admin", email="admin@example.com", password="password", role="ADMIN")
        self.client.force_authenticate(user=self.admin_user)
        
        # Initialize a basic project, which creates some ProjectIndicators
        self.project_indicators_dict = self.initialize_project() 
        self.project = next(iter(self.project_indicators_dict.values())).project # Get the project instance
        self.first_project_indicator = next(iter(self.project_indicators_dict.values())) # Get a ProjectIndicator instance

        # Set minimum_required_evidence_count to 0 for all indicators in the project to prevent "missing evidence" warnings
        for pi in self.project.project_indicators.all():
            pi.indicator.minimum_required_evidence_count = 0
            pi.indicator.save()
        
        # Ensure a mandatory ProjectEvidenceRequirement exists and is approved for export eligibility
        # First, ensure the indicator from the base test has a mandatory EvidenceRequirement
        mandatory_er_for_test = EvidenceRequirement.objects.create(
            indicator=self.first_project_indicator.indicator,
            title="Auto-generated Mandatory Requirement",
            mandatory=True,
            description="Mandatory requirement for ZIP export test setup."
        )
        self.mandatory_per = ProjectEvidenceRequirement.objects.create(
            project=self.project,
            project_indicator=self.first_project_indicator,
            framework_indicator=self.first_project_indicator.indicator, # Add this line
            evidence_requirement=mandatory_er_for_test,
            status=ProjectEvidenceRequirementStatusChoices.APPROVED,
        )

        # Create some approved evidence for the mandatory requirement
        self.approved_evidence = EvidenceItem.objects.create(
            project_indicator=self.first_project_indicator,
            project_evidence_requirement=self.mandatory_per,
            title=f"Approved Evidence for {self.first_project_indicator.indicator.code}",
            approval_status=EvidenceApprovalStatusChoices.APPROVED,
            source_type="TEXT_NOTE",
            text_content="This is a test evidence note for a mandatory requirement.",
            is_current=True,
            uploaded_by=self.admin_user,
        )

        # Re-update all other mandatory requirements to APPROVED to ensure eligibility
        ProjectEvidenceRequirement.objects.filter(
            project=self.project, evidence_requirement__mandatory=True
        ).update(status=ProjectEvidenceRequirementStatusChoices.APPROVED)
        
        # Check eligibility
        eligibility_report = export_eligibility_report(self.project, "final-inspection-pack")
        self.assertTrue(eligibility_report["eligible"], f"Project not eligible: {eligibility_report['reasons']}")
        
        self.zip_export_url = reverse("project-export-final-zip", kwargs={"project_id": self.project.id})

    def tearDown(self):
        super().tearDown()
        # Clean up generated ZIP files and temporary export folders
        if os.path.exists(settings.MEDIA_ROOT / "exports"):
            import shutil
            shutil.rmtree(settings.MEDIA_ROOT / "exports")

    def test_zip_export_blocked_if_not_eligible(self):
        # Make project ineligible (e.g., set a mandatory requirement to MISSING)
        req = ProjectEvidenceRequirement.objects.filter(
            project=self.project, evidence_requirement__mandatory=True
        ).first()
        req.status = ProjectEvidenceRequirementStatusChoices.MISSING
        req.save()

        response = self.client.post(self.zip_export_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data["success"])
        self.assertIn("Export blocked", response.data["error"]["message"])

    @patch("apps.exports.services.log_export_audit")
    def test_zip_export_success_and_file_creation(self, mock_log_export_audit):
        response = self.client.post(self.zip_export_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("file_url", response.data["data"])
        
        zip_file_path = Path(settings.MEDIA_ROOT) / "exports" / Path(response.data["data"]["file_url"]).name
        self.assertTrue(zip_file_path.exists())
        self.assertTrue(zip_file_path.is_file())
        self.assertGreater(zip_file_path.stat().st_size, 0) # Check file is not empty

        # Verify audit log
        mock_log_export_audit.assert_called_once()
        self.assertEqual(mock_log_export_audit.call_args.kwargs["export_type"], "final-inspection-pack")
        self.assertIn("file_path", mock_log_export_audit.call_args.kwargs["details"])

        # Verify ZIP contents (basic structure)
        with zipfile.ZipFile(zip_file_path, "r") as zf:
            namelist = zf.namelist()
            self.assertIn("00_Control_Dashboard/readiness_summary.md", namelist)
            self.assertIn("90_Gaps_and_CAPA/capa_summary.md", namelist)
            self.assertIn("91_Missing_Evidence/missing_evidence_report.csv", namelist)
            self.assertIn("99_Export_Metadata/export_manifest.json", namelist)

    @patch("apps.exports.services.log_export_audit")
    def test_zip_export_contains_approved_evidence(self, mock_log_export_audit):
        response = self.client.post(self.zip_export_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        zip_file_path = Path(settings.MEDIA_ROOT) / "exports" / Path(response.data["data"]["file_url"]).name

        with zipfile.ZipFile(zip_file_path, "r") as zf:
            namelist = zf.namelist()
            # Check for at least one evidence file (from setup)
            found_evidence_file = False
            for pi in self.project.project_indicators.all():
                for evidence in pi.evidence_items.filter(approval_status=EvidenceApprovalStatusChoices.APPROVED):
                    # Construct expected path based on build_final_zip_export logic
                    area_name_safe = "".join(c for c in pi.indicator.area.name if c.isalnum() or c == "_").rstrip()
                    standard_name_safe = "".join(c for c in pi.indicator.standard.name if c.isalnum() or c == "_").rstrip()
                    indicator_code_safe = "".join(c for c in pi.indicator.code if c.isalnum() or c == "_").rstrip()
                    file_label_safe = "".join(c for c in evidence.file_label if c.isalnum() or c == "_").rstrip() or f"evidence_{evidence.id}"
                    
                    expected_path_prefix = f"{pi.indicator.area.code}_{area_name_safe}/"
                    expected_path_prefix += f"{pi.indicator.standard.code}_{standard_name_safe}/{indicator_code_safe}/approved_evidence/"
                    
                    if evidence.source_type == "UPLOAD" and evidence.file_or_url:
                        expected_path = expected_path_prefix + f"{file_label_safe}_{Path(evidence.file_or_url).name}"
                    else: # TEXT_NOTE, URL, EXTERNAL_REF
                        expected_path = expected_path_prefix + f"{file_label_safe}.txt"
                    
                    if any(expected_path in name for name in namelist):
                        found_evidence_file = True
                        break
                if found_evidence_file:
                    break
            self.assertTrue(found_evidence_file, "Approved evidence file not found in ZIP.")

    @patch("apps.exports.services.log_export_audit")
    def test_zip_export_contains_capa_report(self, mock_log_export_audit):
        from apps.indicators.models.capa import Gap, CAPA
        from apps.masters.choices import PriorityChoices, GapStatusChoices, CapaStatusChoices

        # Create a gap and CAPA - use MEDIUM severity so it doesn't block export
        gap = Gap.objects.create(
            project=self.project,
            project_indicator=self.first_project_indicator,
            title="Test Gap",
            description="Test Gap Description",
            severity=PriorityChoices.MEDIUM,
            source=GapSourceChoices.MANUAL,
            created_by=self.admin_user,
        )
        CAPA.objects.create(
            project=self.project,
            gap=gap,
            project_indicator=self.first_project_indicator,
            title="Test CAPA",
            responsible_person=self.admin_user,
            status=CapaStatusChoices.OPEN,
            created_by=self.admin_user,
        )

        response = self.client.post(self.zip_export_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        zip_file_path = Path(settings.MEDIA_ROOT) / "exports" / Path(response.data["data"]["file_url"]).name

        with zipfile.ZipFile(zip_file_path, "r") as zf:
            namelist = zf.namelist()
            self.assertIn("90_Gaps_and_CAPA/capa_report.csv", namelist)
            self.assertIn("90_Gaps_and_CAPA/capa_summary.md", namelist)
            self.assertIn("90_Gaps_and_CAPA/pending_gaps.csv", namelist)

            # Verify content of capa_summary.md
            with zf.open("90_Gaps_and_CAPA/capa_summary.md") as f:
                content = f.read().decode("utf-8")
                self.assertIn("Test CAPA", content)
                self.assertIn("Open CAPAs:** 1", content)
                self.assertIn("High-Risk CAPAs:** 0", content)
