# Browser QA CLI Template

A TypeScript template for building approved-site browser QA and integration-check CLIs with Chrome, Puppeteer, and CDP.

Use this template for owned, internal, or explicitly approved web applications where browser-based checks are part of normal development and operations.

The managed TypeScript launch path in this template uses `puppeteer-extra` with `puppeteer-extra-plugin-stealth`, removes Chrome's default `--enable-automation` switch, and adds `--disable-blink-features=AutomationControlled`. That reduces false positives from obvious automation markers when you use browser-based LLM products, internal tools, and approved QA flows. It does not guarantee access through bot defenses or site risk controls.

## What You Get

- TypeScript ESM CLI with `commander`
- Browser runtime wrapper for either an existing Chrome connection or managed Chrome launch
- Managed Chrome launch with a stealth baseline that reduces obvious automation fingerprints
- Local browser profile consistency controls for timezone, locale, UA, viewport, geolocation, headers, and proxy
- Optional local interaction pacing controls for hover, scroll-into-view, click delay, and typing/key delays
- Local session import/export for cookies and localStorage
- Dedicated local auth profile lifecycle for per-site login/logout and managed profile reuse
- Managed profile clone/show flows for ordinary-user local Chrome setups
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
site-cdp auth login --site docs-example
site-cdp auth logout --site docs-example
site-cdp profile show --site docs-example
site-cdp profile clone "/Users/me/Library/Application Support/Google/Chrome" --site docs-example --source-profile-directory "Profile 4"
site-cdp endpoints
site-cdp inspect-home --headless
site-cdp inspect-home --site docs-example --headless
site-cdp inspect-network --site docs-example --headless
site-cdp search "query" --site docs-example --headless
site-cdp session-export ./session.json
site-cdp session-import ./session.json
site-cdp rpc
```

Common browser options:

- `--cdp-url <url>` attaches to a running Chrome and never owns its lifecycle.
- `--chrome-path <path>` selects Chrome/Chromium when launching; if omitted, the runtime checks `CHROME_PATH` and common OS install paths.
- `--user-data-dir <path>` isolates browser state for launched sessions.
- `--chrome-profile-directory <name>` selects the Chrome profile directory inside the chosen user-data-dir, e.g. `Default` or `Profile 4`.
- `--auth-profile <profileId>` selects one configured auth profile explicitly.
- `--proxy-server <server>` routes launched browser traffic through a local or upstream proxy.
- `--user-agent <ua>` overrides the browser user agent string.
- `--locale <locale>` sets preferred browser languages, e.g. `en-US,en`.
- `--timezone-id <tz>` sets the emulated IANA timezone, e.g. `America/Los_Angeles`.
- `--viewport <viewport>` sets the viewport as `WIDTHxHEIGHT` or `WIDTHxHEIGHT@DEVICE_SCALE`.
- `--geolocation <coords>` sets emulated geolocation as `LATITUDE,LONGITUDE[,ACCURACY]`.
- `--extra-headers <json>` applies extra HTTP headers to page requests.
- `--interaction-hover-before-click` hovers the target before click/focus actions.
- `--interaction-scroll-into-view` scrolls target elements into view before pointer actions.
- `--interaction-click-delay-ms <ms>` delays click completion for local pointer actions.
- `--interaction-type-delay-ms <ms>` delays between typed characters.
- `--interaction-press-delay-ms <ms>` delays keyup during `press` actions.
- `--headless` launches in headless mode when not attaching.
- `--timeout-ms <ms>` controls browser operation timeout.

Stealth notes:

- Managed launches remove Puppeteer's default `--enable-automation` switch and add `--disable-blink-features=AutomationControlled`.
- Attached browsers keep whatever flags they were started with. If you own the attached browser lifecycle, launch it with the same anti-false-positive assumptions you want this CLI to inherit.
- These defaults are for approved QA, browser tooling, and browser-based LLM usage where sites may overreact to raw automation markers. They are not a claim that the template bypasses Cloudflare, DataDome, Akamai, CAPTCHA, rate limits, or account risk systems.

## Local-Only Scope

This template intentionally focuses on local browser operation for user-authorized automation software:

- It supports local Chrome/Chromium launch and local CDP attach.
- It supports local profile reuse, local managed auth profiles, local session import/export, and local environment consistency controls.
- It does not include a first-class cloud browser provider abstraction.
- It does not include CAPTCHA solving or any promise of bypassing site defenses.

## Anti-Fingerprint Guidance

Modern web apps and browser-based LLM products often look for obvious automation markers before they apply stricter risk checks. The goal here is to reduce false positives for approved automation, not to promise stealth against active defenses.

### TypeScript

Use `puppeteer-extra` with `puppeteer-extra-plugin-stealth` instead of plain Puppeteer. The template already does this for managed launches in [browserRuntime.ts](/Users/jin/projects/cdp-cli-template/src/infrastructure/browser/browserRuntime.ts).

Recommended baseline:

```ts
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

const browser = await puppeteer.launch({
  executablePath: '/path/to/Chrome',
  headless: false,
  ignoreDefaultArgs: ['--enable-automation'],
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
  ],
})
```

Why this baseline exists:

- `puppeteer-extra-plugin-stealth` patches common client-side signals such as `navigator.webdriver`, UA quirks, plugins, iframe/runtime leaks, and other easy browser-side bot checks.
- `ignoreDefaultArgs: ['--enable-automation']` removes the default automation-controlled infobar for owned launches.
- `--disable-blink-features=AutomationControlled` removes one of Chrome's clearest automation indicators and reduces `navigator.webdriver` based false positives.

Practical limits:

- This only reduces obvious browser-side detection signals.
- It does not hide IP reputation, request rate, account reputation, TLS fingerprints, or server-side behavioral scoring.
- If you attach to an already-running Chrome, this template cannot retroactively remove launch-time flags from that browser.

### Local Environment Consistency

Beyond the stealth baseline, the template now supports a local consistency layer for browser-based AI agent flows:

- `--locale`
- `--timezone-id`
- `--user-agent`
- `--viewport`
- `--geolocation`
- `--extra-headers`
- `--proxy-server`

These options are meant to keep a user-authorized local browser session internally consistent. They are not intended to impersonate arbitrary devices or accounts.

### Optional Local Interaction Pacing

This template now supports opt-in local interaction pacing for generic DOM actions:

- hover before click/focus
- scroll target elements into view before pointer actions
- add per-click delay
- add per-character typing delay
- add per-key press delay

The runtime applies these settings from the resolved browser profile, so auth profiles and CLI flags can both enable them. Default behavior stays unchanged unless you opt in.

Example:

```sh
npm run dev -- \
  --interaction-scroll-into-view \
  --interaction-hover-before-click \
  --interaction-click-delay-ms 60 \
  --interaction-type-delay-ms 35 \
  search "AI agent"
```

### Local Session Portability

The template now includes:

- `session-export <path>` to write cookies and localStorage to a JSON snapshot
- `session-import <path>` to restore cookies and localStorage into the current local browser session

This complements `--user-data-dir`:

- `--user-data-dir` is the primary path for durable local profile reuse
- `session-export` / `session-import` is the explicit path for moving or restoring lightweight session state

### Dedicated Local Auth Profiles

This template now supports a dedicated local auth-profile pattern for approved multi-site automation:

- the program creates its own profile root under the user home directory by default
- each auth profile gets its own managed directory under `~/.<package-name>/auth/<profileId>/`
- `auth login` opens that dedicated local profile and waits until the configured site login is reusable
- `auth logout` removes only that dedicated local auth profile
- regular site commands can reuse the prepared profile automatically through `site.auth.profileId`
- `--site` and `--auth-profile` let one user manage multiple logged-in sites or accounts, such as Google plus V2EX main and V2EX global

Examples:

```sh
npm run dev -- auth login --site google
npm run dev -- auth login --site v2ex-main
npm run dev -- auth login --site v2ex-global

npm run dev -- inspect-home --site google
npm run dev -- inspect-home --site v2ex-main
npm run dev -- inspect-home --site v2ex-global
```

If an auth profile is referenced by multiple sites, the CLI fails closed and requires `--site`.

### Managed Profile Clone

For ordinary-user local Chrome setups, the template also supports a managed clone flow:

- `profile clone <sourceUserDataDir>` copies a local Chrome user-data-dir into one managed auth profile
- `--source-profile-directory` selects `Default` or `Profile N` inside a multi-profile Chrome root
- `profile show` prints the resolved managed auth paths and remembered state

Example:

```sh
npm run dev -- profile clone "$HOME/Library/Application Support/Google/Chrome" \
  --site v2ex-main \
  --source-profile-directory "Profile 4"

npm run dev -- profile show --site v2ex-main
```

### Python

If you maintain a Python sibling tool, prefer a driver that actively patches Chrome automation markers instead of plain Selenium defaults.

Recommended Selenium-compatible baseline:

- Use `undetected-chromedriver` instead of stock Selenium + ChromeDriver when you need compatibility with existing Selenium code.
- Add the same launch assumptions: remove the automation infobar switch and disable `AutomationControlled`.

Example:

```python
import undetected_chromedriver as uc

options = uc.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

driver = uc.Chrome(options=options, headless=False)
```

Important warning for 2026:

- `undetected-chromedriver` is still widely used, but its maintenance and Chrome-version compatibility can drift.
- Before standardizing on it for a new Python project, re-check the latest package activity and your target Chrome version.
- If your team does not need Selenium API compatibility, evaluate newer CDP-native Python stacks separately.

Research summary used for this guidance:

- As of `2026-05-01`, the most stable TypeScript baseline for reducing obvious browser automation markers remains `puppeteer-extra` plus `puppeteer-extra-plugin-stealth`.
- For Python, `undetected-chromedriver` is still the common compatibility choice, but it carries more maintenance risk than the TypeScript stealth path and should be documented with that caveat.
- In browser-based LLM scenarios, these settings can reduce false positives from raw automation fingerprints, but they should never be described as guaranteed bot-defense bypass.

## JSON-RPC

`site-cdp rpc` reads one JSON-RPC 2.0 request per line from stdin.

```sh
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"system.describe"}' | npm run dev -- rpc
```

Methods:

- `system.describe`
- `site.list`
- `workflow.list`
- `browser.authProfileShow` with optional `{ "siteId": "...", "authProfileId": "..." }`
- `browser.authLogin` with optional `{ "siteId": "...", "authProfileId": "...", "url": "...", "force": true }`
- `browser.authLogout` with optional `{ "siteId": "...", "authProfileId": "..." }`
- `browser.profileClone` with `{ "sourceUserDataDir": "...", "siteId": "...", "authProfileId": "...", "sourceProfileDirectory": "...", "force": true }`
- `endpoint.list`
- `site.inspectHome` with optional `{ "siteId": "..." }`
- `site.inspectNetwork` with optional `{ "siteId": "..." }`
- `site.search` with `{ "query": "...", "siteId": "..." }`
- `browser.sessionExport` with `{ "path": "..." }`
- `browser.sessionImport` with `{ "path": "..." }`

## Element Recognition And Guarded Actions

Some browser QA checks need to identify visible controls from DOM semantics and then perform guarded UI actions. The template includes a generic version of that pattern:

- `src/infrastructure/ui/elementIntrospection.ts` snapshots visible element candidates from selectors, labels, roles, text, placeholders, `aria-*`, `data-testid`, SVG titles, disabled state, and checked/pressed state.
- `src/infrastructure/ui/elementActions.ts` resolves the first enabled visible candidate and performs guarded `click`, `type`, and `press` actions.
- The same action layer can now optionally apply profile-driven hover, scroll, and delay pacing for local false-positive reduction.
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
- `docs-reviewer`: session profile pointing to a dedicated Chrome `userDataDir` prepared by the user or managed by this CLI.
- `docs-public-to-internal`: workflow plan with one public docs search step and one prepared-profile internal docs check.

The template supports both externally prepared profiles and CLI-managed local auth profiles. It records which site requires which profile and which selector can verify expected session state. This keeps public, prepared-profile, and tool-managed flows explicit and testable.

A registry shape looks like this:

```ts
const registry = {
  defaultSiteId: 'docs-internal',
  authProfiles: [
    { id: 'docs-reviewer', label: 'Docs reviewer profile', userDataDir: '/tmp/docs-reviewer-profile', profileDirectory: 'Default' },
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
