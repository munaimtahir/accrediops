# 05 — Critical Gaps (Operator-Grade)

Scope limited to:
1. Missing UI exposure
2. Broken/incomplete flows
3. Role confusion
4. Missing feedback

## A) Missing UI exposure

| Gap | Severity | Status |
|---|---|---|
| Admin/readiness/exports navigation entries were conditionally hidden for restricted users | High | **Closed** — now visible with disabled state + explanation |
| Required evidence checklist was implicit in readiness metrics, not explicit as a section | High | **Closed** — explicit "Required evidence" section added |
| Indicator return action label not explicit in actions panel | Medium | **Closed** — "Return" exposed alongside Reopen |

## B) Broken or incomplete flows

| Gap | Severity | Status |
|---|---|---|
| Project creation/initialization completed without explicit next-step direction | Medium | **Closed** — success feedback now includes next action guidance |
| Recurring submission feedback lacked immediate next-step instruction | Medium | **Closed** — success feedback now states approval handoff |
| Some low-traffic screens still depend on generic explanatory copy rather than explicit "Next Action" banners | Low | **Open** |

## C) Role confusion

| Gap | Severity | Status |
|---|---|---|
| Hidden navigation created ambiguity whether features existed | High | **Closed** |
| Role restrictions existed but not consistently visible at action surface | Medium | **Mostly closed** — major navigation and core action surfaces now explicit |
| Backend endpoint role enforcement varies (some endpoints rely on service-layer checks) | Medium | **Open** (technical hardening backlog) |

## D) Missing feedback / guidance

| Gap | Severity | Status |
|---|---|---|
| Indicator lifecycle needed a clearer top-of-screen readiness + next-action indicator | High | **Closed** |
| Workflow context strip label used generic "Next" rather than explicit operator command language | Medium | **Closed** ("Next Action") |
| Readiness-to-export handoff guidance can be made more prescriptive | Low | **Open** |

## Remaining criticality summary

1. **Operationally critical gaps closed**: feature discoverability, indicator structure, and role-visible controls.
2. **Remaining high-value backlog**: endpoint-level auth consistency hardening and stronger guidance on a few non-core pages.
