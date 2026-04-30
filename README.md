# CDP CLI Template

A TypeScript template for building website-specific CLI tools that automate Chrome through the Chrome DevTools Protocol (CDP).

The template captures lessons from `deepseek-cdp-cli` while avoiding DeepSeek-specific assumptions. Fork it when you need a CLI for sites such as Sogou Weixin, Sogou Zhihu, ChatGPT, Gemini, or any internal web app.

## What You Get

- TypeScript ESM CLI with `commander`
- Browser runtime wrapper for either `--cdp-url` attach or managed Chrome launch
- Site adapter boundary under `src/infrastructure/site`
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
3. Replace or refine `defaultSiteConfig` in `src/infrastructure/site/siteRegistry.ts`.
4. Add a dedicated adapter if the site needs login, shadow DOM handling, upload, streaming, anti-bot settle checks, or custom actions.
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
site-cdp inspect-home --headless
site-cdp search "query" --headless
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
- `site.inspectHome`
- `site.search` with `{ "query": "..." }`

## Repository Layout

```text
src/application/usecases/       orchestration that is independent of CLI/RPC
src/infrastructure/browser/     CDP attach/launch runtime boundary
src/infrastructure/site/        site config and adapter implementation
src/interfaces/cli/             commander CLI and output formatting
src/interfaces/rpc/             JSON-RPC transport
src/shared/                     errors and runtime helpers
specs/site/                     behavior contracts in YAML
test/                           unit, contract, and e2e tests
scripts/                        package/spec verification helpers
```

## Guardrails From Real CDP CLI Work

- Treat selectors as contracts, not incidental implementation details.
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
