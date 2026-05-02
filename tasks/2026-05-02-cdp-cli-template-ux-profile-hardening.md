# PLAN: CDP CLI template UX and profile hardening

## Goal

- Split the requested requirements into template-owned implementation and downstream project guardrails.
- Implement only generic template-library capabilities that every derived CDP CLI can reuse safely.
- Document product/project-specific expectations as constraints for future derived CLIs.

## Requirement Split

### Template Library Code

- Enforce the UX mode split in defaults: login remains headed, command-style browser interactions default headless unless attached to `--cdp-url`.
- Keep JSON as the implementation-first data contract and make `--format text` the readable TUI projection.
- Centralize derived CLI browser state under one parent root: `~/.cdp-cli/<package-name>` by default, still overridable with `SITE_CDP_HOME_DIR`.
- Harden managed auth/session/profile directories with owner-only permissions where the OS supports POSIX modes.
- Check required auth profile readiness before site commands that need login state.
- Preserve `--session <slug>` isolation and existing `browser list` / `browser stop` lifecycle commands.

### Downstream Guardrails / Documentation

- Derived CLIs should implement readable `text` output only after stabilizing `json` output shapes.
- Dependency selection and release upgrades should be audited during architecture/release work; prefer stable security releases and avoid unreviewed day-zero upgrades unless required by a fix.
- Site-specific login checks, selectors, pagination, content views, and TUI presentation remain derived CLI responsibilities.
- Profile cloning must remain minimal and audited; derived CLIs must not introduce whole-profile cloning without explicit review.
- Profile directories contain browser credentials and should never be committed, synced, or shared.

## Guardrails

- Keep browser runtime ownership separate from site actions.
- Prefer typed errors and explicit unsupported states.
- Avoid changing unrelated adapter behavior.
- Do not turn template-level guidance into site-specific business logic.
- Do not remove JSON output or make text formatting the internal data contract.

## Waves

### Wave 1: Impact Check

- [x] Identify CLI/RPC/usecase entry points.
- [x] Identify adapter selectors and browser actions.
- [x] Confirm current failure mode.
- [x] Record minimal change scope.

### Wave 2: Implementation

- [x] Add profile root and permission hardening helpers.
- [x] Apply hardening to managed auth and browser sessions.
- [x] Make browser interaction commands default headless.
- [x] Add auth readiness checks for login-required commands.
- [x] Update specs/docs for downstream constraints.

### Wave 3: Verification

- [x] Add unit or contract tests.
- [x] Run targeted checks.
- [x] Run release-relevant checks if targeted checks pass.

## Wishlist

- Render richer command-mode TUI tables for `--format text` after JSON schemas settle.
- Add a dependency freshness/security audit script that can run during release preflight.
- Add per-site minimal storage migration manifests once derived CLIs define allowed origins.

## Debt / Follow-up

- Windows ACL hardening can be upgraded from best-effort `chmod` to explicit ACL management.
- Full browser-agent security policy docs should be expanded as derived CLIs add real site workflows.

## Audit Notes

- `profile show` readiness now requires a remembered/configured profile plus the actual Chrome profile directory, not just a parent directory.
- `profile clone` now copies only `Local State` and the selected Chrome profile directory, avoiding unrelated Chrome cache directories.
- Copied managed profile directories are recursively hardened after clone.
