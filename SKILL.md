# Browser QA CLI Template Skill

Use this repository as the starting point for approved-site browser QA CLI projects.

## When To Use

Use this template when building a CLI for owned, internal, or explicitly approved web applications that need Chrome-based QA checks, prepared browser profiles, dynamic UI inspection, or DOM-driven workflows.

## Workflow

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>`, then review its changes.
2. Define or refine target sites, session profiles, and workflow plans in `src/infrastructure/site/siteRegistry.ts`.
3. Keep generic runtime code in `src/infrastructure/browser` unchanged unless browser ownership semantics change.
4. Implement site-specific checks behind a `SiteAdapter`; use `src/infrastructure/ui` for semantic element recognition and guarded UI actions.
5. Add endpoint catalog records for documented integration surfaces and verify metadata with `inspect-network`.
6. Expose each action through CLI and JSON-RPC only after the usecase is typed and tested.
7. Record selectors, endpoints, constraints, and known unsupported behavior in `specs/site/*.spec.yml`.
8. Run `npm run quality:check` before handing off.

## Design Rules

- Do not mix site selector logic into CLI parsing.
- Do not model session requirements as a global boolean; attach them to a site and session profile.
- Do not assume a workflow uses one website; represent public and prepared-profile checks as separate steps.
- Keep generic endpoint observation limited to redacted metadata.
- Do not scatter raw DOM snippets across flows; centralize candidate recognition and action execution.
- Do not let RPC skip the application usecase layer.
- Do not silently click optional toggles; normalize desired state first and report ignored/unavailable controls.
- Do not publish from the source tree without installing the generated tarball in a fresh temp project.
- Do not assume generated tests remain valid after `init-site`; review e2e selectors for the new target.
- Prefer small typed adapters over one large browser script.

## Useful Commands

```sh
npm run dev -- describe
npm run dev -- --headless inspect-home
npm run dev -- --headless inspect-network
npm run dev -- endpoints
npm run dev -- --headless search "query"
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"system.describe"}' | npm run dev -- rpc
npm run quality:check
npm run release:preflight
```
