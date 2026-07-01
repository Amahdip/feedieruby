# Server provisioning scripts (sanitized reference)

One-time scripts used to bring up the production host (`ubuntu@37.32.10.71`).
They have already been run. These copies are kept for reproducibility and as
documentation of how the box was configured.

**Secrets are redacted.** Every password / key / token was replaced with
`REDACTED` before these left the server. Do not commit real credentials here —
supply them via environment variables or a secrets manager when re-running.

The plaintext-secret originals that used to sit loose in `/home/ubuntu/` have
been removed from the server.

| Script | Purpose |
|--------|---------|
| `server-bootstrap.sh` | Base host setup — packages, Docker, app dir, initial secrets/URLs |
| `server-configure-rustfs.sh` | Provision the RustFS (S3-compatible) object store + service accounts |
| `server-configure-smtp.sh` | Wire the app's outbound mail (relay via mail.feedyruby.ir, IP-allowlisted) |
| `server-finish-deploy.sh` | Final deploy steps after the stack is up |

> Note: some scripts still reference the pre-rename `salamruby` paths/names —
> they are historical and left as-run for accuracy.
