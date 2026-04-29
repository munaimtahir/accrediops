from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.ai_actions.models import GeneratedOutput, AIUsageLog
from apps.audit.models import AuditEvent
from apps.evidence.models import EvidenceItem
from apps.exports.models import ExportJob, ImportLog, PrintPackItem
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import Indicator, ProjectIndicator, ProjectIndicatorComment, ProjectIndicatorStatusHistory
from apps.masters.choices import ClassificationReviewStatusChoices
from apps.projects.models import AccreditationProject
from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement
from apps.accounts.models import ClientProfile


class Command(BaseCommand):
    help = "Safe clean-slate option to remove testing/project/runtime data while preserving frameworks."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print counts of records that would be deleted/reset without mutating data.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirm deletion of testing/project-level runtime data.",
        )
        parser.add_argument(
            "--reset-classifications",
            action="store_true",
            help="Reset framework-level indicator classification fields.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        confirm = options["confirm"]
        reset_classifications = options["reset_classifications"]

        if not dry_run and not confirm:
            raise CommandError("You must provide either --dry-run or --confirm.")
        
        if dry_run and confirm:
            raise CommandError("Cannot provide both --dry-run and --confirm.")

        models_to_purge = [
            ("Recurring Instances", RecurringEvidenceInstance),
            ("Recurring Requirements", RecurringRequirement),
            ("Generated Outputs", GeneratedOutput),
            ("Print Pack Items", PrintPackItem),
            ("Evidence Items", EvidenceItem),
            ("Project Indicator Comments", ProjectIndicatorComment),
            ("Project Indicator Status History", ProjectIndicatorStatusHistory),
            ("Project Indicators", ProjectIndicator),
            ("Export Jobs", ExportJob),
            ("Accreditation Projects", AccreditationProject),
            ("Client Profiles", ClientProfile),
            ("Import Logs", ImportLog),
            ("Audit Events", AuditEvent),
        ]

        self.stdout.write(self.style.WARNING("--- CLEAN SLATE RESET ---"))
        self.stdout.write(f"Mode: {'DRY RUN' if dry_run else 'CONFIRM'}")
        self.stdout.write(f"Reset Classifications: {'YES' if reset_classifications else 'NO'}\n")

        with transaction.atomic():
            self.stdout.write(self.style.SUCCESS("--- OPERATIONAL DATA TO DELETE ---"))
            for name, model_class in models_to_purge:
                count = model_class.objects.count()
                self.stdout.write(f"{name}: {count}")
                if not dry_run and count > 0:
                    model_class.objects.all().delete()

            self.stdout.write(self.style.SUCCESS("\n--- PRESERVED FRAMEWORK DATA ---"))
            self.stdout.write(f"Frameworks: {Framework.objects.count()}")
            self.stdout.write(f"Areas: {Area.objects.count()}")
            self.stdout.write(f"Standards: {Standard.objects.count()}")
            
            indicator_count = Indicator.objects.count()
            self.stdout.write(f"Indicators: {indicator_count}")

            if reset_classifications:
                self.stdout.write(self.style.SUCCESS("\n--- CLASSIFICATION RESET ---"))
                self.stdout.write(f"Indicators to reset: {indicator_count}")
                if not dry_run and indicator_count > 0:
                    Indicator.objects.update(
                        classification_review_status=ClassificationReviewStatusChoices.UNCLASSIFIED,
                        classification_confidence="",
                        classification_reason="",
                        classified_by_ai_at=None,
                        classification_reviewed_by=None,
                        classification_reviewed_at=None,
                        primary_action_required="",
                        ai_assistance_level="",
                        evidence_frequency="",
                    )

            if dry_run:
                self.stdout.write(self.style.NOTICE("\nDry run complete. No data was mutated."))
                transaction.set_rollback(True)
            else:
                self.stdout.write(self.style.SUCCESS("\nClean slate reset complete."))
Clean slate reset complete."))
