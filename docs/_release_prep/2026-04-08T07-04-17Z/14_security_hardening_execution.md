# 14 — Security Hardening Execution

## Applied hardening
- Set runtime `DJANGO_DEBUG=False`.
- Enabled secure cookie flags:
  - session cookie secure + `SameSite=Lax`
  - CSRF cookie secure + `SameSite=Lax`
- Ensured PHC/OPS hosts and trusted origins are explicit in backend env.
- Confirmed HSTS/security headers at Caddy edge.

## Validation
- Runtime env audit captured in `env_audit_redacted.txt`.
- Response header checks in `headers_check.txt`, `live_headers.txt`, `proxy_headers_report.txt`.
- Deploy check: only W004/W008 remain, tied to proxy-managed SSL/HSTS posture.
