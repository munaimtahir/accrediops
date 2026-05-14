# Physical Evidence Checklist for Indicator {{ indicator.indicator_code }}

## Indicator: {{ indicator.indicator_code }} - {{ indicator.indicator_text }}

### Physical Evidence Items
{% if indicator.evidence_list %}
| Title | Status | Physical Location Type | Location Details | File Label | Physical Copy Available |
|-------|--------|------------------------|------------------|------------|-------------------------|
{% for evidence in indicator.evidence_list %}
{% if evidence.physical_location_type or evidence.is_physical_copy_available %}
| {{ evidence.title }} | {{ evidence.approval_status }} | {{ evidence.physical_location_type }} | {{ evidence.location_details }} | {{ evidence.file_label }} | {{ evidence.is_physical_copy_available }} |
{% endif %}
{% endfor %}
{% else %}
No physical evidence items for this indicator.
{% endif %}
