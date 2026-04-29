# 11_REMAINING_GAPS.md

## Database Performance
With the addition of `AIUsageLog`, the table may grow rapidly if heavily used. A background cleanup job or log rotation strategy should be considered for long-term production.

## Token Estimation
The `tokens_used` field in `AIUsageLog` is currently nullable and not populated by the Gemini API shim. Transitioning to a more robust library (like `tiktoken` for OpenAI or provider-specific counters) would improve cost tracking accuracy.

## Multi-Factor Authentication
While basic password management is implemented, adding MFA for Admin and Lead roles would significantly enhance security for real-world accreditation data.

## Queue Deep Linking
The "Document Generation Queue" does not yet support deep-linking from the indicator detail view. An "Operate in Queue" button on the indicator page would improve workflow fluidity.
