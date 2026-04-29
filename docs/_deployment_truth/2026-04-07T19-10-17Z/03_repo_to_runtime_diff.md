# Repo-to-Runtime Diff

## Source and runtime parity checks
- Deployed app at `:18080` serves Next.js app titled **AccrediOps**.
- Live bundles include projects page chunk:
  - `/_next/static/chunks/app/(workbench)/projects/page-20df98b36a031b00.js`
- Bundle string checks showed card-first signals present:
  - `Project register`
  - `Power view`
  - `Create project`
- Runtime did **not** initially render due to client crash, not because chunk was absent.

## Critical mismatch found
- In `frontend/components/screens/projects-list-screen.tsx`, hooks were ordered as:
  - early `return` on loading/error
  - then `useMemo(...)`
- This violates hooks order stability and caused production runtime crash after data state transitions.
- Browser error captured:
  - `Minified React error #310`
  - stack points into projects page chunk and `useMemo`.

## Fix applied
- Moved `projects` derivation and `frameworkById` `useMemo` above early returns so hook order stays stable across renders.
- This removed the runtime crash and restored live rendering.

