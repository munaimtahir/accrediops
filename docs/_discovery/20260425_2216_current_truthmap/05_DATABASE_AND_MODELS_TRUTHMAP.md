# Database and Models Truth Map

## Canonical Model Comparison

| Expected Field | Implemented? | Model | Field Name | Type | Required? | Gap |
|---|---|---|---|---|---|---|
| Indicator ID | Yes | `Indicator` | `code` | CharField | Yes | None |
| Domain | Yes | `Area` | `area` FK | ForeignKey | Yes | None |
| Standard/Clause | Yes | `Standard` | `standard` FK | ForeignKey | Yes | None |
| Indicator text | Yes | `Indicator` | `text` | TextField | Yes | None |
| Required evidence | Yes | `Indicator` | `required_evidence_description` | TextField | No | None |
| Evidence type | Yes | `Indicator` | `evidence_type` | CharField | Yes | None |
| Current evidence link | Yes | `EvidenceItem` | `file_or_url` | CharField | Yes | None |
| Action required | Yes | `Indicator` | `fulfillment_guidance` | TextField | No | None |
| Owner | Yes | `ProjectIndicator` | `owner` | ForeignKey | No | None |
| Priority | Yes | `ProjectIndicator` | `priority` | CharField | Yes | None |
| Target date | Yes | `ProjectIndicator` | `due_date` | DateField | No | None |
| Status | Yes | `ProjectIndicator` | `current_status` | CharField | Yes | None |
| Approver/reviewer | Yes | `ProjectIndicator` | `approver`, `reviewer` | ForeignKey | No | None |
| Notes | Yes | `ProjectIndicator` | `notes` | TextField | No | None |

## Entity Comparison

| Expected Entity | Implemented Entity/Table | Status | Gap |
|---|---|---|---|
| Indicator | `Indicator` | COMPLETE | None |
| IndicatorAssignment | `ProjectIndicator` (owner field) | COMPLETE | None |
| IndicatorEvidence | `EvidenceItem` | COMPLETE | None |
| IndicatorStatusHistory | `ProjectIndicatorStatusHistory` | COMPLETE | None |
| IndicatorComment | `ProjectIndicatorComment` | COMPLETE | None |
| GeneratedOutput | `GeneratedOutput` | COMPLETE | None |
| User | `User` (custom auth) | COMPLETE | None |
| MasterList | `MasterValue` | COMPLETE | None |
| Domain | `Area` | COMPLETE | None |
| Standard | `Standard` | COMPLETE | None |
| AccreditationStandard | `Framework` | COMPLETE | None |
| Laboratory/FMS standard | N/A | MISSING | Not explicitly defined as a separate entity from generic `Framework`. |
