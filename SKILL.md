# CDP CLI Template Skill

Use this repository as the starting point for website-specific CDP CLI projects.

## When To Use

Use this template when building a CLI that controls a website through Chrome DevTools Protocol, especially when the target website needs real browser state, login cookies, uploads, dynamic UI, or DOM-driven workflows.

## Workflow

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>`, then review its changes.
2. Define or refine target sites, auth profiles, and workflow plans in `src/infrastructure/site/siteRegistry.ts`.
3. Keep generic runtime code in `src/infrastructure/browser` unchanged unless browser ownership semantics change.
4. Implement site-specific actions behind a `SiteAdapter`; use `src/infrastructure/ui` for semantic element recognition and simulated actions.
5. Add endpoint catalog records for authoritative browser APIs and verify them with `inspect-network`.
6. Expose each action through CLI and JSON-RPC only after the usecase is typed and tested.
7. Record selectors, endpoints, constraints, and known unsupported behavior in `specs/site/*.spec.yml`.
8. Run `npm run quality:check` before handing off.

## Design Rules

- Do not mix site selector logic into CLI parsing.
- Do not model login as a global boolean; attach it to a site and auth profile.
- Do not assume a workflow uses one website; represent cross-site discovery and logged-in original reading as separate steps.
- Do not capture request bodies, response bodies, cookies, or authorization headers in generic endpoint observation.
- Do not scatter raw DOM snippets across flows; centralize candidate recognition and action execution.
- Do not let RPC bypass the application usecase layer.
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
