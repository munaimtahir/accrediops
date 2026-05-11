# PHASE 0 — OBJECTIVE FIT CHECK

This document confirms that the "Evidence Pack Builder and Inspection Pack Generator Sprint" aligns with the project's final objective.

## 1. Final Product Objective

Build an AI-based accreditation dashboard that can take a standards checklist/framework and help complete accreditation requirements through:

1.  Framework-level standards/checklist management.
2.  AI classification.
3.  AI documentation generation.
4.  Evidence planning.
5.  Evidence collection.
6.  Review and approval.
7.  Final inspection/readiness pack generation.

## 2. Why Evidence Pack Generation Helps the Objective

YES. This sprint directly addresses a critical part of the final objective: **"Final inspection/readiness pack generation."**

The AI documentation workflow is already implemented, and core workflows are mostly stable. The next missing product capability is the ability to assemble generated drafts, evidence links, required documents, and readiness status into a structured, inspection-ready evidence pack. This moves the project from generating accreditation *parts* to delivering a cohesive, auditable *whole*.

## 3. Why Notifications Remain Delayed

Notifications are a supporting feature, not a core workflow for accreditation completion. Implementing them now would divert resources from the primary objective of generating the evidence pack, which is a foundational requirement. Notifications can be added later to improve user experience without impacting the core functionality.

## 4. Why Production Deployment Remains Delayed

The current baseline has known E2E test failures and flaky tests. Deploying to production with this level of instability is a high risk. The priority is to first stabilize the core workflows and then implement the evidence pack functionality. Only after these are verified and stable should production deployment and its associated hardening (e.g., PostgreSQL migration, production Docker configs) be considered.

## 5. What is Out of Scope

- Notifications
- WebSockets
- Production Docker hardening (unless required for local verification)
- PostgreSQL migration
- New AI model/provider work
- Major UI redesign
- Cosmetic-only changes
- Automatic AI approval of documents
- Direct AI mutation of official evidence status
