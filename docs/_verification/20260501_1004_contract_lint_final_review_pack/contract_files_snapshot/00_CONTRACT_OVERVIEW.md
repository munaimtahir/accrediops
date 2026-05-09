# Contract Overview

## Purpose
The purpose of this contract is to maintain strict frontend-backend alignment.

## Truth Source
The OpenAPI spec in `contracts/openapi/openapi.yaml` remains the primary schema truth. This folder maps the specific connections between the backend APIs (Django) and frontend UI (Next.js).

## Rules for Updating Contract Docs
1. No backend API should be added without documenting expected frontend exposure, unless marked internal-only.
2. No frontend action/button/page should be added without documenting its backend counterpart, unless marked static/display-only.
3. No field should be added to frontend forms/tables unless it exists in the API contract or is explicitly derived/display-only.
4. No role/capability logic should be implemented only in frontend.
5. Backend remains the authority for permissions/capabilities.
6. Contract documentation must be updated in the same sprint as code changes.