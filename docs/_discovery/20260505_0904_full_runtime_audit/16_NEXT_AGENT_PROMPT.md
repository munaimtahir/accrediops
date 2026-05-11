# Next Agent Prompt

You are tasked with stabilizing the AccrediOps codebase based on a recent comprehensive discovery audit. The application is functionally complete but requires critical infrastructure and testing fixes to clear blockers.

Do **NOT** implement new features or modify data models.

## Tasks
1. **Fix Backend Test Hang:** Modify `backend/apps/api/tests/test_ai_generation_gemini.py`. The tests currently hang indefinitely when attempting to reach the real Gemini API. Implement robust `unittest.mock` patching or use `pytest.mark.skipif` to ensure the suite runs completely without a real API key.
2. **Fix Frontend Scripts:** Add `"typecheck": "tsc --noEmit"` to the `scripts` block in `frontend/package.json`.
3. **Fix Frontend Lint Warnings:** Address the unused variables and `react-hooks/exhaustive-deps` warnings in `frontend/components/screens/project-worklist-screen.tsx`, `frontend/components/screens/project-workspace-board.tsx`, and `frontend/components/screens/indicator-drawer.tsx`.
4. **Fix Docker Compose Startup:** Refactor the `frontend` service in `docker-compose.yml`. Remove the `sh -c "npm install --include=dev && npm run build && npm run start"` command. Either create a proper multistage `frontend/Dockerfile` that pre-builds the application or change the command to just `npm run start` (assuming the build happens in the Dockerfile).

## Acceptance Criteria
- `cd backend && pytest --cov` finishes without hanging.
- `cd frontend && npm run lint` returns 0 warnings.
- `cd frontend && npm run typecheck` executes without error.
- `docker compose config` is valid, and running `docker compose up -d` brings up the stack without timing out on the frontend build step.

## Final GO/NO-GO Requirement
Once changes are made, you must run the backend test suite, frontend lint and typecheck commands, and verify Docker syntax. If any fail, correct them before completing the task. 

Store evidence of successful test runs in `docs/_discovery/20260505_0904_full_runtime_audit/stabilization_evidence/`.
