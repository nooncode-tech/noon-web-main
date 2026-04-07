## Contact And Maxwell Runtime Notes

- `POST /api/contact` validates and stores contact inquiries in the local runtime database at `.data/noon.sqlite`.
- `GET /api/maxwell/session` returns the current persisted Maxwell session for the browser cookie, if one exists.
- `POST /api/maxwell/session` creates or updates the first-prompt session that Maxwell restores on return visits.
- `.data/` is ignored on purpose. It is runtime state, not source content.

### Current limitations

- Contact persistence is real inside the app runtime, but proposal email delivery only works after configuring `RESEND_API_KEY`, `MAIL_FROM`, and a public site URL such as `MAXWELL_PUBLIC_BASE_URL`.
- Google sign-in for Maxwell requires `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`.
- Maxwell now preserves the first prompt and session continuity on the current device, but there is still no real user authentication system in this repo.
- Proposal review SLA can now be processed through `GET/POST /api/maxwell/review-sla`. In production, attach a scheduler and authorize it with `CRON_SECRET` or `REVIEW_API_SECRET`.
