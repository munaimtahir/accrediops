# PHASE 3 — TARGET EVIDENCE PACK DESIGN

This document outlines the ideal structure for the inspection-ready evidence pack, based on the requirements provided. This design will guide the implementation in subsequent phases.

## Ideal Inspection Pack Structure

The evidence pack should be a comprehensive, structured output that includes the following components:

### 1. Cover Page / Project Summary
This section will provide high-level details about the project.
- **Framework Name:** The name of the accreditation framework being used.
- **Institution/Client Name:** The name of the client or institution undergoing accreditation.
- **Accreditation Cycle/Project Name:** The specific name or identifier for the accreditation project.
- **Date Generated:** The timestamp when the evidence pack was generated.
- **Overall Readiness Score:** A single, prominent score indicating the project's overall readiness (e.g., a percentage or status).

### 2. Indicator Summary
A consolidated overview of all indicators within the project.
- **Total Indicators:** The total count of indicators in the framework for this project.
- **Met:** Number of indicators fully compliant.
- **Partial:** Number of indicators with partial compliance.
- **Missing:** Number of indicators with no evidence or compliance.
- **Under Review:** Number of indicators currently in a review state.
- **Approved:** Number of indicators whose evidence/status has been approved.
- **Final Evidence Ready:** Number of indicators completely ready for inspection.

### 3. Grouped Indicator Details (Domain-wise & Standard-wise)
The core of the pack, presenting each indicator and its associated evidence, grouped logically.
- **Domain-wise Grouping:** Indicators grouped by their higher-level domain or area.
- **Standard/Clause-wise Ordering:** Within each domain, indicators are ordered by their associated standard or clause.
- **For Each Indicator:**
    - **Indicator ID:** Unique identifier for the project indicator.
    - **Standard/Clause:** The specific standard or clause text.
    - **Indicator Text:** The full text description of the indicator.
    - **Required Evidence:** General description or type of evidence needed.
    - **Evidence Type/Category:** Classification of the evidence (e.g., policy, record, interview).
    - **Current Evidence Status:** The current workflow status of the indicator (e.g., In Process, Under Review, Completed).
    - **Linked Evidence:** A list of official `EvidenceItem` records linked to this indicator.
        - Each evidence item will include: ID, title, approval status, source type, order, notes, physical location details.
        - Reviewer and approval details (who approved, when) to be included here.
    - **Approved Documents:** A clear listing of documents that have been officially approved and promoted as final evidence.
    - **AI-Generated Drafts:** A separate listing of AI-generated drafts linked to the indicator, clearly marked as advisory.
        - Each draft will include: ID, title, content (or summary), generation date, status (e.g., advisory, pending review).
    - **Reviewer/Approver State:** Who reviewed/approved and when, for the indicator itself.
    - **Gap Summary:** A concise summary of any outstanding requirements or non-compliance.
    - **Next Action:** Clear guidance on what needs to be done next for this indicator.
    - **Final Readiness Status:** The specific readiness status for this indicator.

### 4. Consolidated Lists
Dedicated sections for key aspects across all indicators.
- **Missing Evidence List:** A comprehensive, itemized list of all evidence items that are required but currently missing across the project.
- **Partial Evidence List:** An itemized list of all evidence items that are present but incomplete or not fully approved.
- **Approved/Final Evidence List:** A consolidated list of all `EvidenceItem` records that have been fully approved and are considered final.
- **AI Draft List Requiring Review:** A consolidated list of all AI-generated drafts that need human review before promotion.

### 5. Export History
A record of all previous evidence pack generations.
- Details of each generation event (timestamp, user, type of pack, status).

### 6. Final Inspection Checklist
A concise, actionable checklist to ensure all pre-inspection requirements are met.

## Clear Separation of Items

| Item               | Meaning                                      |
| ------------------ | -------------------------------------------- |
| AI draft           | Advisory, not final                          |
| Evidence link/file | Project-specific uploaded/linked proof       |
| Approved evidence  | Reviewed and accepted                        |
| Final pack item    | Ready for inspection                         |
| Missing item       | Still needs work                             |
