# Repository Guidelines

## Project Structure & Module Organization

SalamRuby runs as a pnpm/turbo monorepo. `apps/web` is the Next.js product surface, with feature modules under `app/` and `modules/`, assets in `public/` and `images/`, and Playwright specs in `apps/web/playwright/`. `apps/storybook` renders reusable UI pieces for review. Shared logic lives in `packages/*`: `database` (Prisma schemas/migrations), `surveys`, `js-core`, `types`, plus linting and TypeScript presets (`config-*`). Deployment collateral is kept in `docs/`, `docker/`, and `helm-chart/`. Unit tests sit next to their source as `*.test.ts` or inside `__tests__`.

## Build, Test & Development Commands

- `pnpm install` — install workspace dependencies pinned by `pnpm-lock.yaml`.
- `pnpm db:up` / `pnpm db:down` — start/stop the Docker services backing the app.
- `pnpm dev` — run all app and worker dev servers in parallel via Turborepo.
- `pnpm build` — generate production builds for every package and app.
- `pnpm lint` — apply the shared ESLint rules across the workspace.
- `pnpm test` / `pnpm test:coverage` — execute Vitest suites with optional coverage.
- `pnpm test:e2e` — launch the Playwright browser regression suite.
- `pnpm db:migrate:dev` — apply Prisma migrations against the dev database.

### Survey Packages Build & Cache

The `@salamruby/surveys` package is pre-compiled (Vite → UMD + ESM) and the built bundle is copied to `apps/web/public/js/`. The Next.js app imports from `dist/`, **not** the source files. This means:

- After any change to `packages/surveys` or its dependencies (`packages/survey-ui`, `packages/types`, etc.), you **must rebuild** for changes to take effect in the running app.
- Turborepo caches build outputs aggressively. Always use `--force` to bypass the cache when iterating on survey packages:
  ```
  rm -rf packages/surveys/dist apps/web/public/js/surveys.* node_modules/.cache/turbo
  pnpm build --filter=@salamruby/surveys... --force
  ```
- The browser also caches the UMD bundle (`surveys.umd.cjs`) served from `public/js/`. After rebuilding, do a **hard refresh** (Cmd+Shift+R / Ctrl+Shift+R) or disable the browser cache via DevTools to pick up the new bundle.
- If changes still don't appear, restart the Next.js dev server (`pnpm dev`).

## Production Docker Image (survey server)

Use this workflow when building the **custom SalamRuby app image** for self-hosting (e.g. `survey.salamruby.ir`). Do **not** use the upstream Formbricks image for production.

### Why host build?

`apps/web/Dockerfile` compiles Next.js inside Docker. On typical Mac setups (Docker Desktop ~8 GB RAM), that step often OOMs. The supported path is:

1. Build Next.js on the host (16 GB+ RAM).
2. Package a runtime-only image with `apps/web/Dockerfile.prebuilt`.

### Build locally

```bash
./scripts/build-salamruby-image-from-host.sh
```

Produces `salamruby-app:latest` (linux/amd64). Key files:

- `apps/web/Dockerfile.prebuilt` — runtime image (copies `.next/standalone`, Prisma, migrations).
- `.dockerignore.prebuilt` — allows build artifacts and `node_modules/**/dist` (the default `.dockerignore` excludes them).

### Push to Docker Hub

Registry: [amirmpa/salamruby-survey](https://hub.docker.com/r/amirmpa/salamruby-survey)

```bash
docker login -u amirmpa   # use a Docker Hub access token as password
./scripts/push-salamruby-image-dockerhub.sh
```

Or build + push together:

```bash
PUSH_TO_DOCKERHUB=true ./scripts/build-salamruby-image-from-host.sh
```

Environment overrides: `DOCKERHUB_REPO`, `DOCKERHUB_TAG`, `LOCAL_IMAGE_TAG`.

### Deploy on survey VPS

Server: `survey-salamruby` (`37.32.10.71`), install dir `/home/ubuntu/salamruby`, domain `https://survey.salamruby.ir` (HTTPS via Arvancloud CDN).

```bash
ssh survey-salamruby
sudo docker pull amirmpa/salamruby-survey:latest
cd /home/ubuntu/salamruby
sudo docker compose up -d salamruby-migrate salamruby
```

Or from the repo (after SSH bootstrap): `scripts/survey-server-finish-deploy.sh` — pulls `amirmpa/salamruby-survey:latest`, falls back to `hub.hamdocker.ir/amirmpa/salamruby-survey:latest` if Docker Hub is slow from Iran.

Initial server bootstrap: `scripts/survey-server-bootstrap.sh`.

Configure outbound email (password reset) via Mail-in-a-Box at `mail.salamruby.ir`:

```bash
# On mail-salamruby: allow survey VPS to relay (already done for 37.32.10.71)
# On survey-salamruby:
./scripts/survey-server-configure-smtp.sh
```

Uses `mail@salamruby.ir` as sender, port 587 STARTTLS, no SMTP auth (trusted relay from survey IP).

### WordPress integration (salamruby.ir)

In the [WordPress plugin](https://github.com/salamruby/wordpress) settings:

- **API Host:** `https://survey.salamruby.ir`
- **Workspace ID:** from Settings → Connect Your App in the survey app (or query the `Workspace` table)

File uploads (logos, file-upload questions) need RustFS/S3 + `files.survey.salamruby.ir` DNS — optional for link-only surveys.

### Production stack (minimal)

| Service | Role |
|---------|------|
| `amirmpa/salamruby-survey` | Web app (must be custom build) |
| `postgres` | Database |
| `redis` / Valkey | Cache, jobs (required in v5) |
| `hub` | Analytics API (currently Formbricks hub image) |
| `cube` | Analytics OLAP |
| `traefik` | Reverse proxy |

### Troubleshooting

- **Migrate fails (Prisma engines):** prebuilt image bundles linux-musl engines via a build-time donor stage in `Dockerfile.prebuilt`.
- **Migrate fails (legacy `Product` table):** DB may come from Formbricks; mark obsolete SalamRuby-only migrations as applied in `_prisma_migrations` or skip `salamruby-migrate` if schema is already current.
- **Branding/locales wrong:** server is still on Formbricks image — rebuild and redeploy custom image.
- **Registry pull timeout from Iran:** use HamDocker mirror or SCP `docker save | gzip` as fallback.

## Coding Style & Naming Conventions

TypeScript, React, and Prisma are the primary languages. Use the shared ESLint presets (`@salamruby/eslint-config`) and Prettier preset (110-char width, semicolons, double quotes, sorted import groups). Two-space indentation is standard; prefer `PascalCase` for React components and folders under `modules/`, `camelCase` for functions/variables, and `SCREAMING_SNAKE_CASE` only for constants. When adding mocks, place them inside `__mocks__` so import ordering stays stable.
We are using SonarQube to identify code smells and security hotspots.
Always mark React component props as `Readonly<>` (e.g., `({ children }: Readonly<MyProps>)`).

## Architecture & Patterns

- Next.js app router lives in `apps/web/app` with route groups like `(app)` and `(auth)`. Services live in `apps/web/lib`, feature modules in `apps/web/modules`.
- Server actions wrap service calls and return `{ data }` or `{ error }` consistently.
- Context providers should guard against missing provider usage and use cleanup patterns that snapshot refs inside `useEffect` to avoid React hooks warnings

## Caching

- Use React `cache()` for request-level dedupe and `cache.withCache()` or explicit Redis for expensive data.
- Do not use Next.js `unstable_cache()`.
- Always use `createCacheKey.*` utilities for cache keys.

## i18n (Internationalization)

- All user-facing text must use the `t()` function from `react-i18next`.
- Key naming: use lowercase with dots for nesting (e.g., `common.welcome`).
- Translations are in `apps/web/locales/`. Default is `en-US.json`.
- Lingo.dev is automatically translating strings from en-US into other languages on commit. Run `pnpm i18n` to generate missing translations and validate keys.

## Date and Time Rendering

- All user-facing dates and times must use shared formatting helpers instead of ad hoc `date-fns`, `Intl`, or `toLocale*` calls in components.
- Locale for display must come from the app language source of truth (`user.locale`, `getLocale()`, or `i18n.resolvedLanguage`), not browser defaults or implicit `undefined` locale behavior.
- Locale and time zone are different concerns: locale controls formatting, time zone controls the represented clock/calendar moment.
- Never infer a time zone from locale. If a product-level time zone source of truth exists, use it explicitly; otherwise preserve the existing semantic meaning of the stored value and avoid introducing browser-dependent conversions.
- Machine-facing values for storage, APIs, exports, integrations, and logs must remain stable and non-localized (`ISO 8601` / UTC where applicable).

## Database & Prisma Performance

- Multi-tenancy: All data must be scoped by Organization or Environment.
- Soft Deletion: Check for `isActive` or `deletedAt` fields; use proper filtering.
- Never use `skip`/`offset` with `prisma.response.count()`; only use `where`.
- Separate count and data queries and run in parallel (`Promise.all`).
- Prefer cursor pagination for large datasets.
- When filtering by `createdAt`, include indexed fields (e.g., `surveyId` + `createdAt`).

## Testing Guidelines

Principles:

- Confidence over coverage. Test behavior and outcomes; avoid brittle implementation-detail tests.

Do:

- E2E tests (Playwright): cover critical user flows and regression risks. Extend existing specs or add
  focused new ones in `apps/web/playwright`, keep tests small and well-named, use descriptive filenames
  such as `billing.spec.ts`, tag slow suites with `@slow`, and run the suite before opening a PR.
- Unit tests: cover stable, high-value logic in `.ts` files, such as validators, transformers,
  evaluators, calculations, and edge cases. Keep assertions on inputs and outputs, colocate specs with
  the code they exercise (`utility.test.ts`), and mock network and storage boundaries through helpers
  from `@salamruby/*`.
- Manual QA, especially for releases: verify on staging and file bugs. If a bug is critical, backport and
  re-test.
- Run `pnpm test` before opening a PR and `pnpm test:coverage` when touching critical flows.

Do not:

- Do not write component or UI unit tests for `.tsx` files; React components are covered by Playwright E2E
  tests instead.
- Do not add coverage-driven or low-signal tests.
- Do not write tests that lock implementation details, markup, snapshots, or create churn.
- Do not create mega or flaky E2E tests; avoid timing hacks and unstable dependencies.

Heuristic:

- User journey risk: E2E.
- Pure logic or edge cases: unit test.
- Release readiness: manual QA plus bug/backport loop.

## Documentation (apps/docs)

- Add frontmatter with `title`, `description`, and `icon` at the top of the MDX file.
- Do not start with an H1; use Camel Case headings (only capitalize the feature name).
- Use Mintlify components for steps and callouts.
- If Enterprise-only, add the Enterprise note block described in docs.

## Storybook

- Stories live in `stories.tsx` in the component folder and import from `"./index"`.
- Use `@storybook/react-vite` and organize argTypes into `Behavior`, `Appearance`, `Content`.
- Include Default, Disabled (if supported), WithIcon (if supported), all variants, and edge cases.

## GitHub Actions

- Always set minimal `permissions` for `GITHUB_TOKEN`.
- On `ubuntu-latest`, add `step-security/harden-runner` as the first step.

## Quality Checklist

- Keep code DRY and small; remove dead code and unused imports.
- Follow React hooks rules, keep effects focused, and avoid unnecessary `useMemo`/`useCallback`.
- Prefer type inference, avoid `any`, and use shared types from `@salamruby/types`.
- Keep components focused, avoid deep nesting, and ensure basic accessibility.

## Commit & Pull Request Guidelines

Commits follow a lightweight Conventional Commit format (`fix:`, `chore:`, `feat:`) and usually append the PR number, e.g. `fix: update OpenAPI schema (#6617)`. Keep commits scoped and lint-clean. Pull requests should outline the problem, summarize the solution, and link to issues or product specs. Attach screenshots or gifs for UI-facing work, list any migrations or env changes, and paste the output of relevant commands (`pnpm test`, `pnpm lint`, `pnpm db:migrate:dev`) so reviewers can verify readiness.

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app:{04-glossary.mdx}|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,public-static-pages.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-params.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
