# CDP CLI Template

A TypeScript template for building website-specific CLI tools that automate Chrome through the Chrome DevTools Protocol (CDP).

The template captures lessons from `deepseek-cdp-cli` while avoiding DeepSeek-specific assumptions. Fork it when you need a CLI for sites such as Sogou Weixin, Sogou Zhihu, ChatGPT, Gemini, or any internal web app.

## What You Get

- TypeScript ESM CLI with `commander`
- Browser runtime wrapper for either `--cdp-url` attach or managed Chrome launch
- Site registry and adapter boundary under `src/infrastructure/site`
- Auth profile metadata for sites that need login, while preserving no-login public sites
- Workflow plans for multi-site flows, such as Google discovery followed by logged-in V2EX reading
- Endpoint catalog and sanitized CDP network observation for API drift discovery
- Semantic element introspection and safe simulated actions for DOM-driven workflows
- JSON-RPC stdin/stdout mode for agent integrations
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

Attach to an existing Chrome:

```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/site-cdp-profile

npm run dev -- --cdp-url http://127.0.0.1:9222 inspect-home
```

## Turning This Into A Site CLI

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>` for the first rename pass.
2. Review `package.json`, `package-lock.json`, README examples, and tests after the script runs.
3. Replace or refine `defaultSiteRegistryConfig` in `src/infrastructure/site/siteRegistry.ts`. Start with one site, then add more sites, auth profiles, and workflows as needed.
4. Add a dedicated adapter if a site needs login checks, shadow DOM handling, upload, streaming, anti-bot settle checks, or custom actions.
5. Keep site selectors and request boundaries in `specs/site/*.spec.yml`.
6. Add fast unit tests before live e2e tests.
7. Only publish after a tarball install smoke test in a temp directory.

For environment-only configuration during exploration:

```sh
SITE_ID=weixin-sogou \
SITE_NAME="Sogou Weixin" \
SITE_BASE_URL="https://weixin.sogou.com/" \
SITE_READY_SELECTOR="body" \
SITE_SEARCH_INPUT_SELECTOR="input[name=query]" \
SITE_RESULT_ITEMS_SELECTOR=".news-box li" \
npm run dev -- --headless search "AI"
```

## Commands

```sh
site-cdp describe
site-cdp sites
site-cdp workflows
site-cdp endpoints
site-cdp inspect-home --headless
site-cdp inspect-home --site v2ex --headless
site-cdp inspect-network --site v2ex --headless
site-cdp search "query" --site google --headless
site-cdp rpc
```

Common browser options:

- `--cdp-url <url>` attaches to a running Chrome and never owns its lifecycle.
- `--chrome-path <path>` selects Chrome/Chromium when launching; if omitted, the runtime checks `CHROME_PATH` and common OS install paths.
- `--user-data-dir <path>` isolates browser state for launched sessions.
- `--headless` launches in headless mode when not attaching.
- `--timeout-ms <ms>` controls CDP operation timeout.

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




## Element Recognition And Simulated Actions

Some sites cannot be driven by stable APIs alone. DeepSeek-style CDP CLIs often need to identify visible controls from DOM semantics and then simulate user actions. The template includes a generic version of that pattern:

- `src/infrastructure/ui/elementIntrospection.ts` snapshots visible element candidates from selectors, labels, roles, text, placeholders, `aria-*`, `data-testid`, SVG titles, disabled state, and checked/pressed state.
- `src/infrastructure/ui/elementActions.ts` resolves the first enabled visible candidate and performs safe `click`, `type`, and `press` actions.
- The default generic search adapter now uses this action layer instead of directly calling `page.click()` and `page.keyboard.type()` on raw selectors.

This creates a reusable path for controls like composer inputs, icon-only buttons, toggles, menu items, hidden file inputs, and drift-prone labels. Project-specific adapters should extend this with typed control snapshots rather than scattering raw `querySelector` snippets across flows.

The intended pattern is:

```ts
const target = await resolveElementOrThrow(page, {
  kinds: ['button'],
  labels: ['Send'],
})
await clickElement(page, { selectors: [target.selector] })
```

For fragile UI flows, capture a snapshot first, include candidate labels/selectors in typed errors, and only then perform the simulated action.

## API Endpoint Observation

Many CDP CLIs need more than DOM automation: they need to discover which browser requests are authoritative. DeepSeek-style projects often maintain an endpoint catalog and compare it with live browser observations. This template now includes a generic version of that pattern:

- `src/infrastructure/network/endpointCatalog.ts` defines endpoint records, evidence status, URL patterns, consumers, and notes.
- `src/infrastructure/network/networkObserver.ts` listens to Puppeteer `request`, `response`, and `requestfailed` events.
- `site-cdp endpoints` lists known endpoint catalog records.
- `site-cdp inspect-network --site <siteId>` opens a site and records sanitized network observations.
- JSON-RPC exposes the same surfaces as `endpoint.list` and `site.inspectNetwork`.

The default observer intentionally records metadata only: method, URL, resource type, status, failure text, matched endpoint id, and timestamps. It does not capture request bodies, response bodies, cookies, authorization headers, or other secrets. Project-specific adapters can add controlled body capture later, but the template starts privacy-safe.

Endpoint patterns can be exact paths, absolute URLs, wildcard patterns, or `regex:` patterns:

```ts
const endpointCatalog = {
  records: [
    {
      id: 'v2ex-topic-api',
      method: 'GET',
      urlPattern: 'https://www.v2ex.com/api/*',
      category: 'content',
      evidenceStatus: 'observed',
      description: 'Observed V2EX API call used while reading topics.',
      siteIds: ['v2ex'],
      consumedBy: ['topic reader'],
    },
  ],
}
```

## Multi-Site And Login Model

The template treats login and multi-site routing as registry metadata, not as global CLI state. A project can mix public sites, optional-login sites, and required-login sites in one CLI. For example, a V2EX-oriented CLI might define:

- `google`: public search/discovery site with `auth.mode = "none"`.
- `v2ex`: original content site with `auth.mode = "required"` and `auth.profileId = "v2ex-main"`.
- `v2ex-main`: auth profile pointing to a dedicated Chrome `userDataDir` where the user is already logged in.
- `google-to-v2ex-original`: workflow plan with one public Google search step and one logged-in V2EX open/read step.

The default template does not automate credential entry or captcha solving. It records whether login is required, which browser profile should contain that login, and which selector can be used by a site-specific adapter to verify authenticated state. This keeps public search flows and logged-in reading flows explicit and testable.

A registry shape looks like this:

```ts
const registry = {
  defaultSiteId: 'v2ex',
  authProfiles: [
    { id: 'v2ex-main', label: 'V2EX main account', userDataDir: '/tmp/v2ex-profile' },
  ],
  sites: [
    {
      id: 'google',
      name: 'Google Search',
      baseUrl: 'https://www.google.com/search?q=site%3Av2ex.com',
      selectors: { ready: 'body', searchInput: 'textarea[name=q], input[name=q]', resultItems: 'a' },
      auth: { mode: 'none' },
      roles: ['search'],
    },
    {
      id: 'v2ex',
      name: 'V2EX',
      baseUrl: 'https://www.v2ex.com/',
      selectors: { ready: 'body', resultItems: '.cell, .topic_content' },
      auth: {
        mode: 'required',
        profileId: 'v2ex-main',
        loginUrl: 'https://www.v2ex.com/signin',
        checkSelector: '#Top a[href="/signout"]',
      },
      roles: ['content', 'forum'],
    },
  ],
  workflows: [
    {
      id: 'google-to-v2ex-original',
      name: 'Google search then V2EX original',
      description: 'Use public Google search discovery, then open V2EX with an authenticated profile.',
      steps: [
        { id: 'discover-via-google', siteId: 'google', kind: 'search', description: 'Search Google for V2EX pages.' },
        { id: 'open-v2ex-original', siteId: 'v2ex', kind: 'open', authProfileId: 'v2ex-main', description: 'Open original V2EX page.' },
      ],
    },
  ],
}
```

## Repository Layout

```text
src/application/usecases/       orchestration that is independent of CLI/RPC
src/infrastructure/browser/     CDP attach/launch runtime boundary
src/infrastructure/network/     endpoint catalog and sanitized network observer
src/infrastructure/site/        site config and adapter implementation
src/infrastructure/ui/          semantic element recognition and simulated actions
src/interfaces/cli/             commander CLI and output formatting
src/interfaces/rpc/             JSON-RPC transport
src/shared/                     errors and runtime helpers
specs/site/                     behavior contracts in YAML
test/                           unit, contract, and e2e tests
scripts/                        package/spec verification helpers
```

## Guardrails From Real CDP CLI Work

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
npm install /tmp/cdp-cli-template-0.1.0.tgz
./node_modules/.bin/site-cdp --version
./node_modules/.bin/site-cdp describe --format json
```
