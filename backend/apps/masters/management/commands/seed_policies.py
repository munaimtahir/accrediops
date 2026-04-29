from django.core.management.base import BaseCommand
from apps.masters.models import PolicyDecision

class Command(BaseCommand):
    help = "Seed database-backed policy decisions."

    def handle(self, *args, **options):
        policies = [
            ("AI_IS_ADVISORY_ONLY", "AI is advisory-only.", True),
            ("AI_NO_MUTATE_WORKFLOW", "AI classification does not mutate project workflow.", True),
            ("AI_NO_FINAL_EVIDENCE", "AI generation does not create final evidence automatically.", True),
            ("PROTECT_HUMAN_REVIEWED", "Human-reviewed classifications are protected by default.", True),
            ("PROTECT_MANUALLY_CHANGED", "Manually changed classifications are protected by default.", True),
            ("FORCE_OVERWRITE_ADMIN_ONLY", "Force overwrite requires explicit confirmation and admin-level permission.", True),
            ("NO_APPROVE_UNCLASSIFIED", "Bulk approval must not approve unclassified rows.", True),
            ("LOW_CONFIDENCE_REQUIRES_REVIEW", "Low-confidence AI classifications require review or explicit confirmation.", True),
            ("PROJECT_INHERITS_FRAMEWORK", "Projects inherit framework indicator structure.", True),
            ("PROJECT_NO_REDEFINE", "Projects do not redefine indicators.", True),
            ("FRAMEWORK_UPLOAD_IS_FRAMEWORK_LEVEL", "Framework indicator upload/import is framework-level.", True),
            ("EVIDENCE_PROMOTION_HUMAN", "Evidence promotion requires human action.", True),
            ("CLASSIFICATION_APPROVAL_NO_COMPLIANCE", "Classification approval does not approve project compliance.", True),
        ]

        count = 0
        for code, desc, enforced in policies:
            obj, created = PolicyDecision.objects.update_or_create(
                code=code,
                defaults={"description": desc, "is_enforced": enforced}
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f"Seeded {count} new policy decisions. Total policies: {len(policies)}."))
