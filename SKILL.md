# CDP CLI Template Skill

Use this repository as the starting point for website-specific CDP CLI projects.

## When To Use

Use this template when building a CLI that controls a website through Chrome DevTools Protocol, especially when the target website needs real browser state, login cookies, uploads, dynamic UI, or DOM-driven workflows.

## Workflow

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>`, then review its changes.
2. Define or refine target site identity and base selectors in `src/infrastructure/site/siteRegistry.ts`.
3. Keep generic runtime code in `src/infrastructure/browser` unchanged unless browser ownership semantics change.
4. Implement site-specific actions behind a `SiteAdapter`.
5. Expose each action through CLI and JSON-RPC only after the usecase is typed and tested.
6. Record selectors, constraints, and known unsupported behavior in `specs/site/*.spec.yml`.
7. Run `npm run quality:check` before handing off.

## Design Rules

- Do not mix site selector logic into CLI parsing.
- Do not let RPC bypass the application usecase layer.
- Do not silently click optional toggles; normalize desired state first and report ignored/unavailable controls.
- Do not publish from the source tree without installing the generated tarball in a fresh temp project.
- Do not assume generated tests remain valid after `init-site`; review e2e selectors for the new target.
- Prefer small typed adapters over one large browser script.

## Useful Commands

```sh
npm run dev -- describe
npm run dev -- --headless inspect-home
npm run dev -- --headless search "query"
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"system.describe"}' | npm run dev -- rpc
npm run quality:check
npm run release:preflight
```
