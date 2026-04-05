# Prioritized Build and Debug Plan

## A. Immediate bugs blocking operational use
1. **Fix Playwright auth/login baseline instability**  
   - Why: Verification confidence for protected surfaces is reduced.  
   - Implications: E2E credibility, regression detection.  
   - Action: align tests with auth guard behavior; stabilize login selector/runtime expectation.  
   - Priority: **P0**

## B. Existing features needing completion/wiring
1. **Expose project create + initialize workflow in frontend**  
   - Why: Critical operational workflow currently underexposed.  
   - Implications: product adoption and end-to-end usability.  
   - Action: add create project form + initialize action from projects list/project home.  
   - Priority: **P0**
2. **Strengthen client profile linkage flow**  
   - Why: variable replacement depends on profile linkage.  
   - Action: allow assign/select profile during project create/update UI.  
   - Priority: **P1**
3. **Clarify/expand admin override controls**  
   - Why: avoid read-only ambiguity for admin operations.  
   - Action: explicit actions or explicit read-only labeling.  
   - Priority: **P1**

## C. Features truly not built
1. **Real OpenAPI contract publication**  
   - Why: contract-first doctrine currently not met.  
   - Action: generate and maintain API schema matching implemented routes/serializers.  
   - Priority: **P1**

## D. Nice-to-have / later
1. Deeper visual polish and richer admin analytics.
2. Expanded route-level smoke assertions to full scenario assertions.

## E. Testing and coverage gaps
1. Add Playwright end-to-end flows for evidence review, recurring approval, clone, variable preview.
2. Add frontend component tests for indicator detail command gating and error states.
3. Add backend tests targeting low-covered API views (`exports`, `users`, parts of `admin`).
