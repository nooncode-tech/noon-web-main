## Contact And Maxwell Runtime Notes

- `POST /api/contact` validates and stores contact inquiries in the local runtime database at `.data/noon.sqlite`.
- `GET /api/maxwell/session` returns the current persisted Maxwell session for the browser cookie, if one exists.
- `POST /api/maxwell/session` creates or updates the first-prompt session that Maxwell restores on return visits.
- `.data/` is ignored on purpose. It is runtime state, not source content.

### Current limitations

- Contact persistence is real inside the app runtime, but internal email notification is still not wired because no mail provider is configured in this workspace.
- Maxwell now preserves the first prompt and session continuity on the current device, but there is still no real user authentication system in this repo.
