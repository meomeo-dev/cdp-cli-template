# Changelog

## 0.4.0 - 2026-05-02

- Add a CDP CLI template plan for UX mode, output format, lifecycle, login-state, and profile-hardening boundaries.
- Default command-mode browser runs to headless while keeping `auth login` headed for human-delegated login.
- Move default managed browser state under `~/.cdp-cli/<package-name>` with `SITE_CDP_HOME_DIR` override support.
- Add owner-only directory hardening for managed auth profiles and browser sessions.
- Fail early with `AUTH_PROFILE_NOT_READY` for login-required site commands when the managed auth profile is missing.
- Tighten profile readiness checks and narrow managed profile cloning to `Local State` plus the selected Chrome profile directory.
- Document downstream guardrails for readable TUI projection, dependency/security review, and profile handling.

## 0.3.0 - 2026-05-01

- Switch managed browser launch to `puppeteer-extra` with `puppeteer-extra-plugin-stealth`.
- Remove the default `--enable-automation` switch and add `--disable-blink-features=AutomationControlled` for owned Chrome launches.
- Add local browser profile consistency controls for timezone, locale, UA, viewport, geolocation, headers, and proxy.
- Add optional local interaction pacing controls for hover, scroll-into-view, click delay, and typing/key delays.
- Add local session export/import commands and RPC methods for cookies and localStorage.
- Wire auth profile `userDataDir` and profile defaults into effective browser runtime selection.
- Add dedicated local auth profile login/logout flows plus managed profile clone/show commands for multi-site local browser reuse.
- Document updated anti-fingerprint guidance for approved QA and browser-based LLM usage.

## 0.2.0 - 2026-04-30

- Add multi-site registry support with per-site auth metadata and workflow plans.
- Add endpoint catalog and sanitized network observation surfaces.
- Add semantic element introspection and guarded simulated UI actions.
- Expose site, workflow, endpoint, and network inspection surfaces through CLI and JSON-RPC.

## 0.1.0 - 2026-04-30

- Scaffold a reusable TypeScript CDP CLI template.
- Add browser attach/launch runtime boundaries.
- Add generic site adapter, CLI commands, and JSON-RPC transport.
- Add spec validation, package verification, and release preflight checks.
- Add `init-site` helper for deriving website-specific CLI repositories.
