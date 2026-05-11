# Existing Documentation Review

The repository contains an exceptionally detailed `docs/` folder, preserving architectural doctrine, feature mapping, API contract strategies, and historical sprints.

## Current Documentation
- `00_Project_Summary.md` - `14_Product_Feasibility_Notes.md`: Foundational project doctrine.
- `GEMINI.md`: Development rules and conventions.
- `docs/runtime/`: Documentation detailing API connectivity, Caddy routing, health endpoints, start sequence, and a truth map.
- `docs/testing/`: Coverage matrices, smoke test instructions, E2E test strategy.

## Outdated or Historical Implementations
- `docs/_implementation/`: Contains chronologically named folders tracking feature implementations from early April to May 2026.
- `docs/_verification/`: Contains recent (May 1-2, 2026) contract lint and final review packs.
- `docs/_truthmap/`: Contains late April 2026 action maps.

## Claims Requiring Runtime Verification
- Ensure that the frontend actually mediates all AI interactions as specified in `07_AI_Guardrails.md`.
- Verify the backend app map and directory structure aligns with current implementations (e.g., `docs/12_Backend_App_Map.md`).
- Run the provided test commands (`scripts/testing/run_all_checks.sh`) to see if the recent "hardening sprint" left the codebase in a green state.
