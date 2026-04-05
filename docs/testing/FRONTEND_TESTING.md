# Frontend Testing

## Stack
- Vitest + Testing Library + jsdom

## Scope
- App shell render
- Projects list render
- Worklist render/smoke filter UI presence
- Evidence form interaction
- Recurring queue screen render
- Inspection screen render
- Admin dashboard render
- Export history render

## Commands
- `cd frontend && npm run test`
- `cd frontend && npm run test:coverage`

## Notes
- Tests are component/screen level with mocked hooks for stable deterministic behavior.
- End-to-end behavior is covered in Playwright against live stack.
