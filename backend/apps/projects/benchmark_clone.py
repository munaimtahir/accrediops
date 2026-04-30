import time
from django.test import TestCase
from django.utils import timezone
from apps.accounts.models import Department, User
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import Indicator, ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.projects.services import clone_project
from datetime import timedelta

class BenchmarkCloneProject(TestCase):
    def setUp(self):
        self.department = Department.objects.create(name="Quality")
        self.admin = User.objects.create_user(
            username="admin_user",
            password="x",
            role="ADMIN",
            department=self.department,
            is_staff=True,
            is_superuser=True,
        )
        self.framework = Framework.objects.create(name="Large Framework")
        self.area = Area.objects.create(framework=self.framework, code="A1", name="Area 1", sort_order=1)
        self.standard = Standard.objects.create(framework=self.framework, area=self.area, code="S1", name="Standard 1", sort_order=1)

        # Create 100 indicators to make the loop overhead more noticeable
        indicators = [
            Indicator(
                framework=self.framework,
                area=self.area,
                standard=self.standard,
                code=f"IND-{i:03d}",
                text=f"Indicator {i}",
                is_recurring=(i % 10 == 0),
                sort_order=i
            )
            for i in range(100)
        ]
        Indicator.objects.bulk_create(indicators)

        today = timezone.localdate()
        self.source_project = AccreditationProject.objects.create(
            name="Source Project",
            client_name="Source Client",
            framework=self.framework,
            start_date=today - timedelta(days=1),
            target_date=today,
            created_by=self.admin,
        )
        # Initialize source project indicators
        source_indicators = Indicator.objects.filter(framework=self.framework)
        for indicator in source_indicators:
            ProjectIndicator.objects.create(
                project=self.source_project,
                indicator=indicator,
                priority="MEDIUM",
                due_date=self.source_project.target_date,
            )

    def test_benchmark_clone_project(self):
        start_time = time.time()
        clone_project(
            source_project=self.source_project,
            actor=self.admin,
            name="Cloned Project",
            client_name="Cloned Client"
        )
        end_time = time.time()
        duration = end_time - start_time
        print(f"\nBenchmark: clone_project took {duration:.4f} seconds for 100 indicators")
