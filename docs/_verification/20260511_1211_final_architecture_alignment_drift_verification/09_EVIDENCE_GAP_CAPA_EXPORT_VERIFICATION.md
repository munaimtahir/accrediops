# Evidence, Gap, CAPA, and Export Verification

| Area | Implemented? | Verified? | Limitation | Next Action |
|---|---|---|---|---|
| Generated documents | Yes | Yes | Advisory drafts are present, not final evidence by default | Keep draft/review separation explicit. |
| Uploaded evidence | Yes | Yes | UI does not yet make requirement linkage obvious | Add requirement-level display in the project indicator view. |
| Physical/site evidence | Yes | Yes | Representation exists, but not all screens emphasize it equally | Keep physical evidence visible in print-pack and inspection flows. |
| Signed documents | Yes | Partially | Tracked through evidence items and drafts, not a dedicated signer workflow | Add richer signed-document reporting only if needed later. |
| Filled registers | Yes | Partially | Can be represented as evidence items/drafts | No immediate change required. |
| Photos | Yes | Partially | Stored as evidence sources | No immediate change required. |
| Licenses/certificates | Yes | Partially | Stored as evidence sources | No immediate change required. |
| Staff training evidence | Yes | Partially | Stored as evidence sources | No immediate change required. |
| Missing/partial evidence visibility | Yes | Yes | Still centered on indicator-level summaries | Surface requirement rows in the UI. |
| Gap summary field | Partial | Partially | Gap summary appears in readiness/inspection logic, but not as a mature gap module | Add a proper gap workflow only if next sprint scope needs it. |
| Gap creation from missing evidence | Partial | Partially | Not a full workflow | Keep as planned work if needed. |
| CAPA model/service | No mature model verified | No | Only placeholders are visible in export/readiness logic | Build the CAPA workflow in a dedicated sprint. |
| Open CAPA count in readiness/export | Partial | Partially | Placeholder count exists in export bundle logic | Replace placeholder behavior with real CAPA state. |
| Final pack preview | Yes | Yes | Preview exists, not a final signed ZIP | Keep preview separate from final archive export. |
| Final ZIP export | Not proven | No | No verified final ZIP export path in this sprint | Treat as pending. |
| Set-wise export | Partial | Partially | Structured bundles are present | Continue as a future export-engine task. |
| Standard-wise export | Partial | Partially | Sort/order structure is present | Good enough for preview; not a final archive. |
| Dynamic folder generation from framework areas/standards | Partial | Partially | Bundle ordering exists, not final archive generation | Keep as a later export-engine enhancement. |
| Master evidence index | Partial | Partially | Print bundle contains structured evidence data | Convert into final export artifact only if required. |
| Document register | Partial | Partially | Present in structured bundle surfaces | No mature ZIP export confirmed. |
| Missing evidence report | Yes | Yes | Shown through readiness/inspection blockers | Keep requirement-level fidelity. |
| Pending gap/CAPA report | Partial | Partially | Placeholder behavior remains | Replace placeholder counts with real CAPA tracking. |
| Final readiness summary | Yes | Yes | Readiness is available, but export gating still uses mock data | Replace placeholder export eligibility. |
| Final submission index | Partial | Partially | Export bundle structure exists | Not yet a complete final package. |

### Bottom Line

Final ZIP export is **not verified**. The code currently proves:

- readiness summaries exist
- print-pack preview exists
- inspection-mode preview exists
- structured evidence ordering exists

But the final archive/export engine is still pending or only partially implemented.

