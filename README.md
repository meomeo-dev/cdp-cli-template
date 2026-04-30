# Browser QA CLI Template

A TypeScript template for building approved-site browser QA and integration-check CLIs with Chrome, Puppeteer, and CDP.

Use this template for owned, internal, or explicitly approved web applications where browser-based checks are part of normal development and operations.

## What You Get

- TypeScript ESM CLI with `commander`
- Browser runtime wrapper for either an existing Chrome connection or managed Chrome launch
- Site registry and adapter boundary under `src/infrastructure/site`
- Session profile metadata for approved apps that require a prepared browser profile
- Workflow plans for multi-app QA flows across approved environments
- Endpoint metadata catalog and redacted network observation for integration health checks
- Semantic element introspection and guarded UI actions for browser-driven checks
- JSON-RPC stdin/stdout mode for local tool integrations
- Contract and unit test scaffolding
- Playwright e2e test slot for real browser flows
- YAML spec validation so behavior remains explicit
- Package verification for npm tarball readiness

## Quick Start

```sh
cd ~/projects/cdp-cli-template
npm install
npm run release:preflight
node dist/src/cli.js describe
```

Inspect the default example site:

```sh
npm run dev -- --headless inspect-home --format json
```

Connect to an existing Chrome instance:

```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/site-cdp-profile

npm run dev -- --cdp-url http://127.0.0.1:9222 inspect-home
```

## Turning This Into A Site CLI

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>` for the first rename pass.
2. Review `package.json`, `package-lock.json`, README examples, and tests after the script runs.
3. Replace or refine `defaultSiteRegistryConfig` in `src/infrastructure/site/siteRegistry.ts`. Start with one approved site, then add more sites, session profiles, and workflows as needed.
4. Add a dedicated adapter if a site needs session-state checks, shadow DOM handling, streaming UI states, or custom QA actions.
5. Keep site selectors and request boundaries in `specs/site/*.spec.yml`.
6. Add fast unit tests before live e2e tests.
7. Only publish after a tarball install smoke test in a temp directory.

For environment-only configuration during exploration:

```sh
SITE_ID=docs-example \
SITE_NAME="Example Docs" \
SITE_BASE_URL="https://example.com/docs/" \
SITE_READY_SELECTOR="body" \
SITE_SEARCH_INPUT_SELECTOR="input[name=query]" \
SITE_RESULT_ITEMS_SELECTOR=".doc-card, article" \
npm run dev -- --headless search "AI"
```

## Commands

```sh
site-cdp describe
site-cdp sites
site-cdp workflows
site-cdp endpoints
site-cdp inspect-home --headless
site-cdp inspect-home --site docs-example --headless
site-cdp inspect-network --site docs-example --headless
site-cdp search "query" --site docs-example --headless
site-cdp rpc
```

Common browser options:

- `--cdp-url <url>` attaches to a running Chrome and never owns its lifecycle.
- `--chrome-path <path>` selects Chrome/Chromium when launching; if omitted, the runtime checks `CHROME_PATH` and common OS install paths.
- `--user-data-dir <path>` isolates browser state for launched sessions.
- `--headless` launches in headless mode when not attaching.
- `--timeout-ms <ms>` controls browser operation timeout.

## JSON-RPC

`site-cdp rpc` reads one JSON-RPC 2.0 request per line from stdin.

```sh
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"system.describe"}' | npm run dev -- rpc
```

Methods:

- `system.describe`
- `site.list`
- `workflow.list`
- `endpoint.list`
- `site.inspectHome` with optional `{ "siteId": "..." }`
- `site.inspectNetwork` with optional `{ "siteId": "..." }`
- `site.search` with `{ "query": "...", "siteId": "..." }`

## Element Recognition And Guarded Actions

Some browser QA checks need to identify visible controls from DOM semantics and then perform guarded UI actions. The template includes a generic version of that pattern:

- `src/infrastructure/ui/elementIntrospection.ts` snapshots visible element candidates from selectors, labels, roles, text, placeholders, `aria-*`, `data-testid`, SVG titles, disabled state, and checked/pressed state.
- `src/infrastructure/ui/elementActions.ts` resolves the first enabled visible candidate and performs guarded `click`, `type`, and `press` actions.
- The default generic search adapter uses this action layer instead of directly calling `page.click()` and `page.keyboard.type()` on raw selectors.

This creates a reusable path for controls like search fields, icon-only buttons, toggles, menu items, and drift-prone labels. Project-specific adapters should extend this with typed control snapshots rather than scattering raw `querySelector` snippets across flows.

The intended pattern is:

```ts
const target = await resolveElementOrThrow(page, {
  kinds: ['button'],
  labels: ['Search'],
})
await clickElement(page, { selectors: [target.selector] })
```

For fragile UI checks, capture a snapshot first, include candidate labels/selectors in typed errors, and only then perform the guarded action.

## Endpoint Metadata Observation

Many QA CLIs need more than DOM checks: they need to confirm that documented integration surfaces are still reached by the browser. This template includes a generic version of that pattern:

- `src/infrastructure/network/endpointCatalog.ts` defines endpoint records, evidence status, URL patterns, consumers, and notes.
- `src/infrastructure/network/networkObserver.ts` listens to Puppeteer `request`, `response`, and `requestfailed` events.
- `site-cdp endpoints` lists known endpoint catalog records.
- `site-cdp inspect-network --site <siteId>` opens a site and records redacted network metadata.
- JSON-RPC exposes the same surfaces as `endpoint.list` and `site.inspectNetwork`.

The default observer intentionally records metadata only: method, redacted URL, resource type, status, failure text, matched endpoint id, and timestamps. Detailed request data stays outside the generic observation model so the template starts privacy-safe.

Endpoint patterns can be exact paths, absolute URLs, wildcard patterns, or `regex:` patterns:

```ts
const endpointCatalog = {
  records: [
    {
      id: 'docs-search-api',
      method: 'GET',
      urlPattern: 'https://example.com/docs/api/*',
      category: 'content',
      evidenceStatus: 'observed',
      description: 'Observed docs API call used by the QA smoke check.',
      siteIds: ['docs-example'],
      consumedBy: ['docs smoke check'],
    },
  ],
}
```

## Multi-Site And Session Model

The template treats session requirements and multi-site routing as registry metadata, not as global CLI state. A project can mix public docs, optional-session apps, and prepared-profile apps in one CLI. For example, an internal docs CLI might define:

- `docs-public`: public docs site with `auth.mode = "none"`.
- `docs-internal`: approved internal docs site with `auth.mode = "required"` and `auth.profileId = "docs-reviewer"`.
- `docs-reviewer`: session profile pointing to a dedicated Chrome `userDataDir` prepared by the user.
- `docs-public-to-internal`: workflow plan with one public docs search step and one prepared-profile internal docs check.

The default template expects account setup to happen outside the generic project. It records whether a prepared browser profile is required and which selector can be used by a site-specific adapter to verify expected session state. This keeps public and prepared-profile flows explicit and testable.

A registry shape looks like this:

```ts
const registry = {
  defaultSiteId: 'docs-internal',
  authProfiles: [
    { id: 'docs-reviewer', label: 'Docs reviewer profile', userDataDir: '/tmp/docs-reviewer-profile' },
  ],
  sites: [
    {
      id: 'docs-public',
      name: 'Public Docs',
      baseUrl: 'https://example.com/docs/',
      selectors: { ready: 'body', searchInput: 'input[name=q]', resultItems: 'a' },
      auth: { mode: 'none' },
      roles: ['docs', 'search'],
    },
    {
      id: 'docs-internal',
      name: 'Internal Docs',
      baseUrl: 'https://example.com/internal/docs/',
      selectors: { ready: 'body', resultItems: '.doc-card, article' },
      auth: {
        mode: 'required',
        profileId: 'docs-reviewer',
        loginUrl: 'https://example.com/internal/docs/session',
        checkSelector: '[data-session-ready="true"]',
      },
      roles: ['docs', 'internal'],
    },
  ],
  workflows: [
    {
      id: 'docs-public-to-internal',
      name: 'Public docs then internal docs',
      description: 'Use public docs search, then open internal docs with a prepared browser profile.',
      steps: [
        { id: 'search-public-docs', siteId: 'docs-public', kind: 'search', description: 'Search public docs.' },
        { id: 'open-internal-docs', siteId: 'docs-internal', kind: 'open', authProfileId: 'docs-reviewer', description: 'Open internal docs.' },
      ],
    },
  ],
}
```

## Repository Layout

```text
src/application/usecases/       orchestration that is independent of CLI/RPC
src/infrastructure/browser/     Chrome connection/launch runtime boundary
src/infrastructure/network/     endpoint catalog and redacted network observer
src/infrastructure/site/        site config and adapter implementation
src/infrastructure/ui/          semantic element recognition and guarded actions
src/interfaces/cli/             commander CLI and output formatting
src/interfaces/rpc/             JSON-RPC transport
src/shared/                     errors and runtime helpers
specs/site/                     behavior contracts in YAML
test/                           unit, contract, and e2e tests
scripts/                        package/spec verification helpers
```

## Guardrails From Browser QA CLI Work

- Treat selectors, semantic controls, and API endpoints as contracts, not incidental implementation details.
- Separate browser runtime ownership from site actions.
- Prefer typed errors over string matching.
- Make every CLI action callable from RPC or another interface.
- Test normalization and output shape without a browser.
- Add live browser tests only around stable user-visible behavior.
- Keep release tarballs ignored, then install and smoke test the tarball before publishing.
- Keep generated package contents narrow; tests and specs should not be included in the npm tarball unless intentionally exposed.

## Release Smoke

```sh
npm run release:preflight
npm pack --pack-destination /tmp .
TMPDIR=$(mktemp -d /tmp/site-cdp-install-XXXXXX)
cd "$TMPDIR"
npm init -y >/dev/null
npm install /tmp/cdp-cli-template-0.2.0.tgz
./node_modules/.bin/site-cdp --version
./node_modules/.bin/site-cdp describe --format json
```
