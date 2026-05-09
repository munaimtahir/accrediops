from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from apps.masters.choices import ProjectIndicatorStatusChoices
from apps.workflow.transitions import validate_transition


class WorkflowTransitionsTest(SimpleTestCase):
    def test_validate_transition_allows_expected_move(self):
        validate_transition(ProjectIndicatorStatusChoices.NOT_STARTED, ProjectIndicatorStatusChoices.IN_PROGRESS)

    def test_validate_transition_rejects_invalid_move(self):
        with self.assertRaises(ValidationError):
            validate_transition(ProjectIndicatorStatusChoices.NOT_STARTED, ProjectIndicatorStatusChoices.MET)

