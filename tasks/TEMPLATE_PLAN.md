# PLAN: <task title>

## Goal

- <describe desired behavior>

## Guardrails

- Keep browser runtime ownership separate from site actions.
- Prefer typed errors and explicit unsupported states.
- Avoid changing unrelated adapter behavior.

## Waves

### Wave 1: Impact Check

- [ ] Identify CLI/RPC/usecase entry points.
- [ ] Identify adapter selectors and browser actions.
- [ ] Confirm current failure mode.
- [ ] Record minimal change scope.

### Wave 2: Implementation

- [ ] Add or refine typed usecase behavior.
- [ ] Update adapter implementation.
- [ ] Update CLI/RPC output shape if needed.
- [ ] Update specs/docs.

### Wave 3: Verification

- [ ] Add unit or contract tests.
- [ ] Add e2e test only if the behavior needs a real browser.
- [ ] Run targeted checks.
- [ ] Run release-relevant checks.

## Wishlist

- <non-blocking improvements>

## Debt / Follow-up

- <known deferred work>
