# Open Questions For Owner

1. **Laboratory/FMS Standards:** Should the new lab/FMS standards be implemented as a completely separate Django app/module, or simply as a new instance of the existing `Framework` -> `Area` -> `Standard` models?
2. **File Storage:** We currently accept URLs or paths for Evidence. Do we need to set up S3/Cloud Storage immediately for physical file uploads, or is linking to external drives (Google Drive/Sharepoint) sufficient for now?
3. **Action Center:** The AI generates text that is saved. Do you want a "1-click apply" button that moves this text directly into an Evidence Item, or must users manually copy-paste to enforce review?
4. **Notifications:** Should we integrate an email service (e.g., SendGrid/AWS SES) right now to notify Reviewers and Approvers when items are assigned?
5. **Production Domain:** Is `apk.alshifalab.pk` confirmed as the final production domain for configuring Caddy and CSRF origins?
