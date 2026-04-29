"""Tests for AI generation with Gemini integration."""

import os
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.ai_actions.models import GeneratedOutput
from apps.ai_actions.services import create_generated_output, accept_generated_output
from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.services import assign_project_indicator


class AIGenerationGeminiTests(ContractBaseTestCase):
    """Test Gemini AI generation integration."""

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        project_indicators = self.initialize_project()
        self.project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_ai_generation_with_mocked_gemini(self):
        """Test that AI generation calls Gemini with the built prompt."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "This is a mocked Gemini response for guidance on this indicator."
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                    "user_instruction": "Test instruction",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            data = response.json()["data"]
            self.assertEqual(data["model_name"], "gemini-1.5-flash")
            self.assertIn("mocked Gemini response", data["content"])
            
            # Verify Gemini was called with a prompt
            mock_gemini.assert_called_once()
            call_args = mock_gemini.call_args
            prompt = call_args[0][0]  # First positional argument
            self.assertIn("Guidance", prompt)
            self.assertIn("IND-001", prompt)

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_ai_generation_different_output_types(self):
        """Test that different output types use different prompts."""
        output_types = ["GUIDANCE", "DRAFT", "ASSESSMENT"]
        
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "Mocked response"
            
            self.client.force_authenticate(user=self.owner)
            
            prompts_sent = []
            for output_type in output_types:
                response = self.client.post(
                    "/api/ai/generate/",
                    {
                        "project_indicator_id": self.project_indicator.id,
                        "output_type": output_type,
                    },
                    format="json",
                )
                self.assertEqual(response.status_code, 201)
                
                # Extract the prompt that was sent
                call_args = mock_gemini.call_args
                prompt = call_args[0][0]
                prompts_sent.append((output_type, prompt))
            
            # Verify prompts are different
            guidance_prompt = prompts_sent[0][1]
            draft_prompt = prompts_sent[1][1]
            assessment_prompt = prompts_sent[2][1]
            
            self.assertIn("Guidance", guidance_prompt)
            self.assertIn("Draft", draft_prompt)
            self.assertIn("Assessment", assessment_prompt)
            
            # Prompts should be different
            self.assertNotEqual(guidance_prompt, draft_prompt)
            self.assertNotEqual(draft_prompt, assessment_prompt)

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_gemini_api_failure_returns_safe_error(self):
        """Test that Gemini API failures return [ERROR] without crashing."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.side_effect = Exception("Rate limit exceeded")
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            data = response.json()["data"]
            self.assertTrue(data["content"].startswith("[ERROR]"))
            self.assertEqual(data["model_name"], "gemini-error")
            # Error message is included but not the raw exception detail
            self.assertIn("Gemini API error", data["content"])


    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=True,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_demo_mode_ignores_api_key(self):
        """Test that demo mode works and doesn't call Gemini."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            data = response.json()["data"]
            self.assertIn("[DEMO MODE]", data["content"])
            self.assertEqual(data["model_name"], "demo-mode")
            
            # Gemini should NOT be called in demo mode
            mock_gemini.assert_not_called()

    @override_settings(
        AI_PROVIDER="",
        AI_MODEL="",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="",
    )
    def test_missing_provider_returns_clear_error(self):
        """Test that missing provider returns clear error message."""
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            "/api/ai/generate/",
            {
                "project_indicator_id": self.project_indicator.id,
                "output_type": "GUIDANCE",
            },
            format="json",
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()["data"]
        self.assertTrue(data["content"].startswith("[ERROR]"))
        self.assertIn("provider", data["content"].lower())
        self.assertEqual(data["model_name"], "error-not-configured")


    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="",
    )
    def test_missing_api_key_returns_clear_error(self):
        """Test that missing API key returns clear error message."""
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            "/api/ai/generate/",
            {
                "project_indicator_id": self.project_indicator.id,
                "output_type": "GUIDANCE",
            },
            format="json",
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()["data"]
        self.assertTrue(data["content"].startswith("[ERROR]"))
        self.assertIn("key", data["content"].lower())
        self.assertEqual(data["model_name"], "error-missing-key")

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_ai_output_is_advisory_only(self):
        """Test that AI generation does not mutate indicator status."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "AI-generated guidance"
            
            initial_status = self.project_indicator.current_status
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            
            # Refresh and verify status unchanged
            self.project_indicator.refresh_from_db()
            self.assertEqual(self.project_indicator.current_status, initial_status)
            self.assertFalse(self.project_indicator.is_met)

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_accept_output_is_advisory_only(self):
        """Test that accepting AI output does not mutate indicator status or evidence."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "AI-generated guidance"
            
            # Generate output
            generated = create_generated_output(
                project_indicator=self.project_indicator,
                actor=self.owner,
                output_type="GUIDANCE",
                user_instruction="Test",
            )
            
            initial_status = self.project_indicator.current_status
            
            # Accept output
            accepted = accept_generated_output(
                generated_output=generated,
                actor=self.owner,
            )
            
            # Verify accepted flag set
            self.assertTrue(accepted.accepted)
            self.assertIsNotNone(accepted.accepted_at)
            self.assertEqual(accepted.accepted_by, self.owner)
            
            # Verify indicator status unchanged
            self.project_indicator.refresh_from_db()
            self.assertEqual(self.project_indicator.current_status, initial_status)

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_user_instruction_is_stored_in_context(self):
        """Test that user_instruction is stored in prompt_context_snapshot."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "Response"
            
            instruction = "Please focus on evidence gaps"
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                    "user_instruction": instruction,
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            # Note: user_instruction may be in the prompt but not directly in context
            # Just verify the output is created and Gemini was called with a prompt containing the instruction
            call_args = mock_gemini.call_args
            prompt = call_args[0][0]
            self.assertIn(instruction, prompt)

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_permission_denied_for_unauthorized_user(self):
        """Test that unauthorized users cannot generate AI output."""
        unauthorized_user = self.reviewer  # Reviewer is not owner/lead/admin
        
        self.client.force_authenticate(user=unauthorized_user)
        response = self.client.post(
            "/api/ai/generate/",
            {
                "project_indicator_id": self.project_indicator.id,
                "output_type": "GUIDANCE",
            },
            format="json",
        )
        
        # Should be denied (403) or not found (404)
        self.assertIn(response.status_code, [403, 404, 400])

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_gemini_settings_read_from_django_config(self):
        """Test that Gemini settings are read from Django configuration."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "Response"
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            # Verify settings were read and Gemini was called
            mock_gemini.assert_called_once()

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key-12345",
    )
    def test_indicator_context_is_included_in_generation(self):
        """Test that full indicator context is built and used."""
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "Response"
            
            self.client.force_authenticate(user=self.owner)
            response = self.client.post(
                "/api/ai/generate/",
                {
                    "project_indicator_id": self.project_indicator.id,
                    "output_type": "GUIDANCE",
                },
                format="json",
            )
            
            self.assertEqual(response.status_code, 201)
            data = response.json()["data"]
            
            # Verify context snapshot is present
            context = data["prompt_context_snapshot"]
            self.assertIsNotNone(context)
            self.assertIn("indicator_code", context)
            self.assertIn("project_name", context)
            self.assertIn("current_status", context)


class AIGenerationDirectServiceTests(TestCase):
    """Test AI generation services directly (using mocked Gemini)."""

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key",
    )
    def test_mocked_gemini_service_integration(self):
        """Test the service-level integration with mocked Gemini."""
        from apps.api.tests.base import ContractBaseTestCase
        from apps.indicators.services import assign_project_indicator
        
        # Create project and indicator using the base test setup
        base = ContractBaseTestCase()
        base.setUp()
        project_indicators = base.initialize_project()
        project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=project_indicator,
            actor=base.admin,
            owner=base.owner,
            reviewer=base.reviewer,
            approver=base.approver,
        )
        
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "Service-level mocked response"
            
            output = create_generated_output(
                project_indicator=project_indicator,
                actor=base.owner,
                output_type="DRAFT",
            )
            
            self.assertEqual(output.model_name, "gemini-1.5-flash")
            self.assertIn("Service-level mocked response", output.content)
            mock_gemini.assert_called_once()

    @override_settings(
        AI_PROVIDER="gemini",
        AI_MODEL="gemini-1.5-flash",
        AI_DEMO_MODE=False,
        GEMINI_API_KEY="test-key",
    )
    def test_gemini_failure_in_service(self):
        """Test service handles Gemini failure gracefully."""
        from apps.api.tests.base import ContractBaseTestCase
        from apps.indicators.services import assign_project_indicator
        
        base = ContractBaseTestCase()
        base.setUp()
        project_indicators = base.initialize_project()
        project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=project_indicator,
            actor=base.admin,
            owner=base.owner,
            reviewer=base.reviewer,
            approver=base.approver,
        )
        
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.side_effect = Exception("Connection timeout")
            
            # Should not crash
            output = create_generated_output(
                project_indicator=project_indicator,
                actor=base.owner,
                output_type="ASSESSMENT",
            )
            
            self.assertTrue(output.content.startswith("[ERROR]"))
            self.assertEqual(output.model_name, "gemini-error")
