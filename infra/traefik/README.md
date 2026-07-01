# Traefik (production reverse proxy)

Single Traefik instance on the prod host (`ubuntu@37.32.10.71`) that fronts
every site. Deployed at `/home/ubuntu/traefik/`; this directory is the tracked
source of truth for it.

## Why this exists

The proxy used to run from `/home/ubuntu/salamruby/docker-compose.yml`. That
directory was deleted, leaving the container **orphaned** — running only on
open inodes, with bind mounts pointing at files that no longer existed. A host
reboot or `docker restart` could not have recreated it, and losing it takes
down **all** sites simultaneously. These files were reconstructed byte-exact
from the running container and re-homed under a real, version-controlled
compose project.

## Topology

| Site | Backend container | Network |
|------|-------------------|---------|
| feedyruby.ir | `feedyruby-salamruby-1` (Next.js :3000) | `feedyruby_default` |
| files.feedyruby.ir | `feedyruby-rustfs-1` | `feedyruby_default` |
| techruby.ir | `techruby-web` (Next.js :3000) | `techruby_default` |

Traefik is attached to **both** networks. Drop either and the corresponding
site 502s. Routing is label-driven (Docker provider) — see each backend's
`traefik.*` labels in its own compose.

`techruby_default` was renamed from the old, misleading `salamruby_default`
(techruby has nothing to do with salamruby). It is currently a manually-created
external bridge network shared by `techruby-web` + `traefik`. Optional future
hardening: let `/home/ubuntu/rubytech/docker-compose.yml` own it as its project
default instead of `external`.

## TLS

`acme.json` is intentionally empty. The host is in Iran and cannot reach Let's
Encrypt (ACME endpoint is Cloudflare-hosted and blocked), so ACME issuance
fails and Traefik serves its built-in self-signed cert. This is fine: every
site sits behind ArvanCloud, which terminates real public TLS at the edge and
accepts the self-signed cert on the origin pull. The repeated
"Unable to obtain ACME certificate … i/o timeout" lines in the Traefik log are
expected, not a regression.

## Deploy / recover

```sh
# on the host
cd /home/ubuntu/traefik
docker compose config          # validate
docker compose up -d           # create/refresh
docker compose logs -f traefik # watch
```

If a backend was moved between networks while running, its socket may still be
bound to the old interface — recreate that backend (not just `restart`, which
can trip over a stale HostConfig network reference):

```sh
cd /home/ubuntu/rubytech && docker compose up -d --no-build --force-recreate web
```

## Known remaining leftover (not yet done)

Inside `/home/ubuntu/feedyruby/docker-compose.yml`, the feedyruby web service is
still **named `salamruby`** (container `feedyruby-salamruby-1`, Traefik routers
`salamruby` / `salamruby-cache`). Renaming it to `feedyruby` recreates the live
survey app container, so it was deferred to a deliberate maintenance window.
