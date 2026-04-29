"""
AI Prompt and Context Building

Builds indicator-aware context and prompt templates for AI generation.
Supports three output types: GUIDANCE, DRAFT, ASSESSMENT.
All context extraction uses safe getattr access to handle missing fields gracefully.
"""

from typing import Dict, Any


def build_indicator_ai_context(project_indicator) -> Dict[str, Any]:
    """
    Build rich, indicator-aware context for AI generation.

    Extracts all safe fields from project_indicator, related indicator, and evidence.
    Uses safe getattr access so missing fields do not crash.

    Args:
        project_indicator: ProjectIndicator instance

    Returns:
        Dictionary with indicator context, safe for JSON serialization
    """
    context = {}

    # Project context
    project = getattr(project_indicator, "project", None)
    if project:
        context["project_id"] = project.id
        context["project_name"] = getattr(project, "name", "Unknown Project")
        context["client_name"] = getattr(project, "client_name", "")
        context["accrediting_body_name"] = getattr(project, "accrediting_body_name", "")

    # Indicator context
    indicator = getattr(project_indicator, "indicator", None)
    if indicator:
        context["indicator_code"] = getattr(indicator, "code", "")
        context["indicator_text"] = getattr(indicator, "text", "")
        context["required_evidence_description"] = getattr(
            indicator, "required_evidence_description", ""
        )
        context["evidence_type"] = getattr(indicator, "evidence_type", "")
        context["document_type"] = getattr(indicator, "document_type", "")
        context["fulfillment_guidance"] = getattr(indicator, "fulfillment_guidance", "")
        context["minimum_required_evidence_count"] = getattr(
            indicator, "minimum_required_evidence_count", 1
        )
        context["is_recurring"] = getattr(indicator, "is_recurring", False)

        # Area (domain/domain name)
        area = getattr(indicator, "area", None)
        if area:
            context["area_code"] = getattr(area, "code", "")
            context["area_name"] = getattr(area, "name", "")

        # Standard
        standard = getattr(indicator, "standard", None)
        if standard:
            context["standard_code"] = getattr(standard, "code", "")
            context["standard_name"] = getattr(standard, "name", "")
            context["standard_description"] = getattr(standard, "description", "")

    # Project indicator specific context
    context["current_status"] = getattr(project_indicator, "current_status", "NOT_STARTED")
    context["priority"] = getattr(project_indicator, "priority", "MEDIUM")
    context["due_date"] = str(getattr(project_indicator, "due_date", None))
    context["notes"] = getattr(project_indicator, "notes", "")
    context["is_finalized"] = getattr(project_indicator, "is_finalized", False)
    context["is_met"] = getattr(project_indicator, "is_met", False)

    # Assignment context (names instead of IDs for readability)
    owner = getattr(project_indicator, "owner", None)
    context["owner"] = owner.get_full_name() if owner else "Unassigned"

    reviewer = getattr(project_indicator, "reviewer", None)
    context["reviewer"] = reviewer.get_full_name() if reviewer else "Unassigned"

    approver = getattr(project_indicator, "approver", None)
    context["approver"] = approver.get_full_name() if approver else "Unassigned"

    # Evidence context
    evidence_items = getattr(project_indicator, "evidence_items", None)
    if evidence_items is not None:
        all_evidence = list(evidence_items.all()) if hasattr(evidence_items, "all") else evidence_items
        context["total_evidence_count"] = len(all_evidence)

        # Count by approval status
        approved_count = sum(
            1
            for item in all_evidence
            if getattr(item, "approval_status", None) == "APPROVED"
        )
        rejected_count = sum(
            1 for item in all_evidence if getattr(item, "approval_status", None) == "REJECTED"
        )
        context["approved_evidence_count"] = approved_count
        context["rejected_evidence_count"] = rejected_count

        # Evidence titles/summaries (first 5)
        evidence_titles = [
            getattr(item, "title", f"Evidence {i+1}") for i, item in enumerate(all_evidence[:5])
        ]
        context["evidence_titles"] = evidence_titles
    else:
        context["total_evidence_count"] = 0
        context["approved_evidence_count"] = 0
        context["rejected_evidence_count"] = 0
        context["evidence_titles"] = []

    return context


def build_guidance_prompt(context: Dict[str, Any], user_instruction: str = "") -> str:
    """
    Build a prompt for GUIDANCE output type.

    Guidance: Generate a practical action plan to close the indicator.
    Includes current situation, missing evidence, next steps, responsible person, etc.

    Args:
        context: Indicator context from build_indicator_ai_context()
        user_instruction: Optional additional instruction from user

    Returns:
        Formatted prompt string for AI generation
    """
    prompt = f"""
## Accreditation Indicator Guidance

**Project:** {context.get('project_name', 'Unknown')}
**Indicator Code:** {context.get('indicator_code', 'Unknown')}
**Indicator Text:** {context.get('indicator_text', 'No text provided')}

**Domain/Area:** {context.get('area_name', 'Unknown')}
**Standard:** {context.get('standard_code', 'Unknown')} - {context.get('standard_name', 'Unknown')}

**Current Status:** {context.get('current_status', 'NOT_STARTED')}
**Priority:** {context.get('priority', 'MEDIUM')}

**Required Evidence:**
- Type: {context.get('evidence_type', 'Unknown')}
- Document Type: {context.get('document_type', 'Unknown')}
- Minimum Count: {context.get('minimum_required_evidence_count', 1)}
- Description: {context.get('required_evidence_description', 'No description')}

**Current Evidence Status:**
- Total Evidence: {context.get('total_evidence_count', 0)}
- Approved: {context.get('approved_evidence_count', 0)}
- Rejected: {context.get('rejected_evidence_count', 0)}
- Existing Evidence: {', '.join(context.get('evidence_titles', [])[:3]) or 'None yet'}

**Assignments:**
- Owner: {context.get('owner', 'Unassigned')}
- Reviewer: {context.get('reviewer', 'Unassigned')}
- Approver: {context.get('approver', 'Unassigned')}

**Notes:** {context.get('notes', 'No notes')}

---

**Task:** Generate a practical action plan to help close this indicator.

Include:
1. Current situation assessment
2. Missing evidence (identify gaps)
3. Immediate next steps (be specific and actionable)
4. Suggested responsible person and timeline
5. Documents or procedures to prepare
6. Review and approval steps
7. Final readiness checklist

Be specific to this indicator's requirements. Suggest realistic steps the team can take.
{f'Additional guidance from user: {user_instruction}' if user_instruction else ''}
""".strip()

    return prompt


def build_draft_prompt(context: Dict[str, Any], user_instruction: str = "") -> str:
    """
    Build a prompt for DRAFT output type.

    Draft: Generate a draft document/SOP/policy/checklist according to the indicator need.
    Includes title, purpose, scope, responsibilities, procedure, etc.

    Args:
        context: Indicator context from build_indicator_ai_context()
        user_instruction: Optional additional instruction from user

    Returns:
        Formatted prompt string for AI generation
    """
    prompt = f"""
## Accreditation Indicator Draft Document

**Project:** {context.get('project_name', 'Unknown')}
**Indicator Code:** {context.get('indicator_code', 'Unknown')}
**Indicator Text:** {context.get('indicator_text', 'No text provided')}

**Domain/Area:** {context.get('area_name', 'Unknown')}
**Standard:** {context.get('standard_code', 'Unknown')} - {context.get('standard_name', 'Unknown')}

**Document/Procedure Type:** {context.get('document_type', 'Unknown')}
**Evidence Type Required:** {context.get('evidence_type', 'Unknown')}

**Required Evidence Description:**
{context.get('required_evidence_description', 'No description provided')}

**Fulfillment Guidance:**
{context.get('fulfillment_guidance', 'No specific guidance provided')}

**Current Context:**
- Status: {context.get('current_status', 'NOT_STARTED')}
- Evidence collected: {context.get('total_evidence_count', 0)} items ({context.get('approved_evidence_count', 0)} approved)
- Due Date: {context.get('due_date', 'No due date')}

---

**Task:** Generate a professional draft document or standard operating procedure (SOP) for this indicator.

The document should include:
1. Title (clear and specific to this requirement)
2. Purpose (why this document is needed)
3. Scope (who it applies to, what it covers)
4. Responsibilities (who does what)
5. Procedure or steps (detailed, numbered, actionable)
6. Records/Evidence required (what must be kept as proof)
7. Review and approval section (signature lines, dates)

Make the draft professional, concise, and ready for use. Focus on the specific requirements stated in this indicator.
{f'Additional instruction from user: {user_instruction}' if user_instruction else ''}
""".strip()

    return prompt


def build_assessment_prompt(context: Dict[str, Any], user_instruction: str = "") -> str:
    """
    Build a prompt for ASSESSMENT output type.

    Assessment: Generate a gap assessment and readiness judgement.
    Includes readiness status, evidence present/missing, risk level, recommendations.

    Args:
        context: Indicator context from build_indicator_ai_context()
        user_instruction: Optional additional instruction from user

    Returns:
        Formatted prompt string for AI generation
    """
    prompt = f"""
## Accreditation Indicator Readiness Assessment

**Project:** {context.get('project_name', 'Unknown')}
**Indicator Code:** {context.get('indicator_code', 'Unknown')}
**Indicator Text:** {context.get('indicator_text', 'No text provided')}

**Domain/Area:** {context.get('area_name', 'Unknown')}
**Standard:** {context.get('standard_code', 'Unknown')} - {context.get('standard_name', 'Unknown')}

**Current Workflow Status:** {context.get('current_status', 'NOT_STARTED')}
**Priority:** {context.get('priority', 'MEDIUM')}
**Finalized:** {context.get('is_finalized', False)}
**Met:** {context.get('is_met', False)}

**Evidence Requirements:**
- Required Type: {context.get('evidence_type', 'Unknown')}
- Document Type: {context.get('document_type', 'Unknown')}
- Minimum Required Count: {context.get('minimum_required_evidence_count', 1)}
- Description: {context.get('required_evidence_description', 'No description')}

**Evidence Status:**
- Total Evidence Items: {context.get('total_evidence_count', 0)}
- Approved Evidence: {context.get('approved_evidence_count', 0)}
- Rejected Evidence: {context.get('rejected_evidence_count', 0)}
- Evidence Items: {', '.join(context.get('evidence_titles', [])[:5]) or 'No evidence yet'}

**Assignments:**
- Owner: {context.get('owner', 'Unassigned')}
- Reviewer: {context.get('reviewer', 'Unassigned')}
- Approver: {context.get('approver', 'Unassigned')}

**Notes:** {context.get('notes', 'No notes')}

---

**Task:** Perform a readiness assessment for this indicator.

Provide:
1. **Readiness Status**: Is this indicator ready for approval? (Yes/No/Partial)
2. **Evidence Present**: What evidence requirements are met?
3. **Evidence Missing**: What gaps remain?
4. **Risk Level**: Low/Medium/High risk of failure?
5. **Recommended Actions**: What should be done next?
6. **Timeline**: Estimated time to readiness
7. **Approval Readiness**: Can this proceed to review/approval now?

Base your assessment on the evidence and status provided. Be specific about what is missing and what risks exist.
{f'Additional instruction from user: {user_instruction}' if user_instruction else ''}
""".strip()

    return prompt


def build_prompt_for_output_type(
    output_type: str, context: Dict[str, Any], user_instruction: str = ""
) -> str:
    """
    Build a prompt for the specified output type.

    Routes to the appropriate builder (GUIDANCE, DRAFT, ASSESSMENT).

    Args:
        output_type: Type of output ("GUIDANCE", "DRAFT", "ASSESSMENT")
        context: Indicator context from build_indicator_ai_context()
        user_instruction: Optional additional instruction from user

    Returns:
        Formatted prompt string for AI generation

    Raises:
        ValueError: If output_type is not recognized
    """
    output_type_upper = output_type.upper() if output_type else ""

    if output_type_upper == "GUIDANCE":
        return build_guidance_prompt(context, user_instruction)
    elif output_type_upper == "DRAFT":
        return build_draft_prompt(context, user_instruction)
    elif output_type_upper == "ASSESSMENT":
        return build_assessment_prompt(context, user_instruction)
    else:
        raise ValueError(
            f"Unknown output_type: {output_type}. Supported types: GUIDANCE, DRAFT, ASSESSMENT"
        )
