# Security

Security model and non-negotiable rules for MiniAdda. Expanded in Stages 5–8.

## Principles

1. **Never trust the client.** Hidden buttons or secret URLs are not security.
2. **Credentials never reach the browser.** The GitHub token lives only as a Cloudflare Worker secret.
3. **Two independent checks.** Cloudflare Access gates the admin; the Worker separately verifies the Access JWT on every request.
4. **Least privilege.** The GitHub token is fine-grained and limited to one repo, contents read/write only.
5. **Validate everything.** Strict per-field validation; writes limited to an allowlist of paths.
6. **Fail closed.** On any auth/validation error, reject — do not fall back to permissive behavior.
7. **Audit.** Every publish/unpublish/delete is logged.

## Threats & mitigations

| Threat | Mitigation |
| --- | --- |
| Token theft via frontend | Token only in Worker secret; never in JS/HTML/storage/responses |
| Unauthorized API calls | Access JWT verification + email allowlist + rate limiting |
| Path traversal / arbitrary writes | Path allowlist (`src/content/articles/`, `public/uploads/`); reject `..`, absolute paths |
| Malicious content | Sanitize Markdown output; validate URLs; escape as needed |
| Malicious uploads | Validate MIME by magic bytes, size limit, allowed types only |
| CSRF | Never trust browser fetch alone; JWT + same-origin checks; no cookie-based auth to Worker |
| Info leakage | Generic error messages; never log/return tokens or stack traces |
| Over-privileged GitHub token | Fine-grained PAT, single repo, contents-only |

## Out of scope / accepted risks

- The public site repo is **public** (required for free GitHub Pages). Articles are public by design; there are **no drafts**, so nothing unpublished is ever committed.
- A deleted article remains in git history (acceptable; public site removes it).
- Build latency (commit → CI → deploy) means "published" is not instantly live.
- GitHub PAT rotation is manual (document a runbook in Stage 5).

## Audit checklist (Stage 8)

- [ ] Grep built `dist/` and `admin/` for token-like strings
- [ ] Confirm Worker never echoes secrets in responses/logs
- [ ] Attempt unauthenticated API calls → rejected
- [ ] Attempt JWT tampering / wrong email → rejected
- [ ] Attempt path traversal and oversized/invalid uploads → rejected
- [ ] Confirm repo is private and PAT scope is minimal
- [ ] Confirm admin is unreachable without Access
