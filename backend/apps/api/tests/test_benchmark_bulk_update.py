from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.frameworks.models.framework import Framework, Area, Standard
from apps.indicators.models.indicator import Indicator
from apps.accounts.models.user import User
from apps.masters.choices import ClassificationReviewStatusChoices, RoleChoices
from django.utils import timezone
import time
from django.db import connection
from django.test.utils import CaptureQueriesContext

class BenchmarkBulkUpdate(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(email="admin@test.com", role=RoleChoices.ADMIN)
        self.client.force_authenticate(user=self.user)
        self.framework = Framework.objects.create(name="Test Framework")
        self.area = Area.objects.create(framework=self.framework, code="A1", name="Area 1")
        self.standard = Standard.objects.create(framework=self.framework, area=self.area, code="S1", name="Standard 1")

        # Create 1000 indicators
        indicators = [
            Indicator(
                framework=self.framework,
                area=self.area,
                standard=self.standard,
                code=f"IND-{i}",
                text=f"Indicator {i}",
                classification_review_status=ClassificationReviewStatusChoices.NEEDS_REVIEW
            )
            for i in range(1000)
        ]
        Indicator.objects.bulk_create(indicators)
        self.indicator_ids = list(Indicator.objects.values_list('id', flat=True))

    def test_benchmark(self):
        url = reverse('admin-framework-classification-bulk-review', args=[self.framework.id])
        payload = {
            "mode": "selected",
            "indicator_ids": self.indicator_ids,
            "action": "approve",
            "updates": {
                "classification_confidence": "HIGH"
            }
        }

        start_time = time.time()
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.post(url, payload, format='json')
        end_time = time.time()

        self.assertEqual(response.status_code, 200)
        print(f"\nNumber of DB queries: {len(ctx.captured_queries)}")
        print(f"Time taken for 1000 items: {end_time - start_time:.4f} seconds")
