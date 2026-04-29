# 05 — Release Strategy

## Strategy executed
1. **Audit first:** inventory runtime, data, auth/proxy, and deployment truth.
2. **Classify data:** separate KEEP vs DELETE test/demo entities with explicit manifests.
3. **Back up before destructive operations:** SQLite snapshot backup captured.
4. **Cleanup in controlled passes:** initial cleanup, post-test cleanup, strict cleanup, and post-smoke cleanup.
5. **Fix auth/runtime alignment:** host/origin/cookie/security settings aligned to live PHC domain behavior.
6. **Verify comprehensively:** backend tests, frontend tests/build, Playwright, live auth and workflow smoke.
7. **Publish evidence and verdict:** artifacts and release-prep docs finalized.

## Strategy principle
Prefer minimal, production-safe corrections over architectural rewrites.
