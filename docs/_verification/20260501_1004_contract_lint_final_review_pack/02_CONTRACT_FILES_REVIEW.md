# Contract Files Review

Folder: `docs/_contracts/20260430_2003_frontend_backend_contract_update/`

Placeholder scan basis:
- `python3 scripts/check_contract_docs.py` (fails on TODO/TBD/FIXME/fill-later/placeholder)

## File-by-file status

### `00_CONTRACT_OVERVIEW.md`
- Status: PARTIAL
- Line count: 14
- Meaningful tables/lists: Yes (rule list)
- TODO/TBD placeholders: No
- Usable for drift prevention: Partially (defines purpose/rules, not mappings)
- Summary: Purpose, truth sources, and update rules.

### `01_API_ROUTE_CONTRACT.md`
- Status: COMPLETE
- Line count: 79
- Meaningful tables/lists: Yes (route table)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: Backend route inventory and intended FE exposure notes.

### `02_FRONTEND_SCREEN_CONTRACT.md`
- Status: COMPLETE
- Line count: 41
- Meaningful tables/lists: Yes (screen table)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: Screen/route list with intended backend dependencies.

### `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
- Status: COMPLETE
- Line count: 27
- Meaningful tables/lists: Yes (action → endpoint mapping)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: User actions mapped to backend endpoints/services.

### `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
- Status: COMPLETE
- Line count: 21
- Meaningful tables/lists: Yes (endpoint → screen mapping)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: Backend endpoints mapped back to screens/actions.

### `05_DATA_FIELD_CONTRACT.md`
- Status: PARTIAL
- Line count: 15
- Meaningful tables/lists: Yes (field list)
- TODO/TBD placeholders: No
- Usable for drift prevention: Partially (covers DocumentDraft fields only)
- Summary: DocumentDraft field-level expectations.

### `06_RBAC_CAPABILITY_CONTRACT.md`
- Status: COMPLETE
- Line count: 26
- Meaningful tables/lists: Yes (capability matrix table)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes (high-level)
- Summary: Roles and capability matrix with backend evidence pointers.

### `07_STATUS_WORKFLOW_CONTRACT.md`
- Status: COMPLETE
- Line count: 29
- Meaningful tables/lists: Yes (transition table)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: Project Indicator statuses + allowed transitions.

### `08_TESTING_CONTRACT.md`
- Status: COMPLETE
- Line count: 24
- Meaningful tables/lists: Yes (gate checklist)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes
- Summary: Minimum test gates and contract update expectations.

### `09_DRIFT_PREVENTION_RULES.md`
- Status: COMPLETE
- Line count: 11
- Meaningful tables/lists: Yes (rule list)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes (rules)
- Summary: 10 drift prevention rules.

### `10_CONTRACT_GAPS_AND_DECISIONS.md`
- Status: PARTIAL
- Line count: 13
- Meaningful tables/lists: Yes (gap bullets)
- TODO/TBD placeholders: No
- Usable for drift prevention: Partially (tracks known gaps, not exhaustive)
- Summary: Known gaps/decisions (e.g., print pack backend).

### `INDEX.md`
- Status: COMPLETE
- Line count: 19
- Meaningful tables/lists: Yes (links list)
- TODO/TBD placeholders: No
- Usable for drift prevention: Yes (navigation)
- Summary: Index/entrypoint to contract docs.
