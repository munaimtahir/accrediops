# Phase 0 — Objective Fit Report

## 1. Final Product Objective
Build an AI-based accreditation dashboard that can take a standards checklist/framework and help complete accreditation requirements through:
1. Framework-level standards/checklist management.
2. AI classification.
3. AI documentation generation.
4. Evidence planning.
5. Evidence collection.
6. Review and approval.
7. Final inspection/readiness pack generation.

## 2. Why Evidence Pack Generation helps the objective
The evidence pack is the "final deliverable" of the accreditation journey. While we have tools for classification, drafting, and collection, we currently lack the ability to aggregate these components into a structured, ordered, and inspection-ready format. Implementing this builder completes the end-to-end journey from framework import to final delivery.

## 3. Why Notifications remain delayed
Reliability of the data and the export process is more critical than communication alerts. Notifications can be added as a layer once the core "source of truth" (the evidence pack) is stable and verifiable.

## 4. Why Production Deployment remains delayed
Production readiness requires a 100% green test suite and a hardened infrastructure. We are currently at 95% E2E reliability. This sprint aims to bridge that gap while delivering the final core feature.

## 5. What is out of scope
- Notifications.
- WebSockets.
- Production Docker hardening.
- PostgreSQL migration.
- New AI model/provider work.
- Major UI redesign.
- Cosmetic-only changes.
- Automatic AI approval of documents.
- Direct AI mutation of official evidence status.
