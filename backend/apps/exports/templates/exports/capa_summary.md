# CAPA Summary for Project "{{ project.name }}"

## Overview
- **Total CAPAs:** {{ bundle.project_summary.readiness.total_capa }}
- **Open CAPAs:** {{ bundle.project_summary.readiness.open_capa_count }}
- **Submitted CAPAs:** {{ bundle.project_summary.readiness.submitted_capa_count }}
- **Closed CAPAs:** {{ bundle.project_summary.readiness.closed_capa_count }}
- **High-Risk CAPAs:** {{ bundle.project_summary.readiness.high_risk_capa_count }}
- **Overdue CAPAs:** {{ bundle.project_summary.readiness.overdue_capa_count }}

## Open CAPAs Requiring Attention
{% if bundle.consolidated_lists.pending_capa %}
{% for capa in bundle.consolidated_lists.pending_capa %}
### CAPA ID: {{ capa.id }} - {{ capa.title }}
- **Linked Indicator:** {{ capa.indicator_code }}
- **Status:** {{ capa.status }}
- **Severity:** {{ capa.severity }}
- **Responsible Person:** {{ capa.responsible_person | default:"Unassigned" }}
- **Due Date:** {{ capa.due_date | default:"Not set" }}
- **Root Cause:** {{ capa.root_cause | default:"N/A" }}
- **Corrective Action:** {{ capa.corrective_action | default:"N/A" }}
- **Preventive Action:** {{ capa.preventive_action | default:"N/A" }}
{% endfor %}
{% else %}
No open CAPAs found.
{% endif %}

---
_This summary reflects the CAPA status at the time of export. For real-time data, please refer to the live dashboard._
