# Readiness Summary for Project "{{ project.name }}"

## Overview
- **Project Name:** {{ project.name }}
- **Framework:** {{ bundle.project_summary.framework_name }}
- **Generated On:** {{ bundle.project_summary.date_generated }}
- **Overall Readiness Score:** {{ bundle.project_summary.overall_readiness_score }}%

## Indicator Status
- **Total Indicators:** {{ bundle.project_summary.total_indicators }}
- **Met Indicators:** {{ bundle.project_summary.met_indicators }}
- **Partial Indicators:** {{ bundle.project_summary.partial_indicators }}
- **Missing Indicators:** {{ bundle.project_summary.missing_indicators }}
- **Under Review Indicators:** {{ bundle.project_summary.under_review_indicators }}
- **Final Evidence Ready Indicators:** {{ bundle.project_summary.final_evidence_ready_indicators }}

## Export Eligibility
- **Eligible for Export:** {{ bundle.project_summary.export_eligibility.eligible }}
- **Reasons for Ineligibility:**
    {% if bundle.project_summary.export_eligibility.reasons %}
    {% for reason in bundle.project_summary.export_eligibility.reasons %}
    - {{ reason }}
    {% endfor %}
    {% else %}
    - None
    {% endif %}

## CAPA Summary
- **Open Gaps:** {{ bundle.project_summary.readiness.open_gap_count }}
- **Open CAPAs:** {{ bundle.project_summary.readiness.open_capa_count }}
- **High-Risk CAPAs:** {{ bundle.project_summary.readiness.high_risk_capa_count }}
- **Overdue CAPAs:** {{ bundle.project_summary.readiness.overdue_capa_count }}

---
_This summary reflects the project's state at the time of export. For real-time data, please refer to the live dashboard._
