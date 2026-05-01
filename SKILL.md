# Browser QA CLI Template Skill

Use this repository as the starting point for approved-site browser QA CLI projects.

The managed TypeScript runtime in this template already enables `puppeteer-extra` with `puppeteer-extra-plugin-stealth`, removes the default `--enable-automation` switch, and disables Blink's `AutomationControlled` feature for owned launches. It also supports local browser profile consistency controls, optional local interaction pacing, local session import/export, dedicated local auth profile login/logout, and managed profile clone/show flows. Treat all of that as false-positive reduction for approved QA and browser-based tool integrations, not as a guarantee of bypassing site defenses.

## When To Use

Use this template when building a CLI for owned, internal, or explicitly approved web applications that need Chrome-based QA checks, prepared browser profiles, dynamic UI inspection, or DOM-driven workflows.

## Workflow

1. Run `node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>`, then review its changes.
2. Define or refine target sites, session profiles, and workflow plans in `src/infrastructure/site/siteRegistry.ts`.
3. If the project needs user-authorized login reuse, configure one auth profile per site/account and prefer `auth login` / `auth logout` over ad hoc browser directory instructions.
4. Keep generic runtime code in `src/infrastructure/browser` unchanged unless browser ownership semantics change.
5. Implement site-specific checks behind a `SiteAdapter`; use `src/infrastructure/ui` for semantic element recognition and guarded UI actions.
6. Add endpoint catalog records for documented integration surfaces and verify metadata with `inspect-network`.
7. Expose each action through CLI and JSON-RPC only after the usecase is typed and tested.
8. Record selectors, endpoints, constraints, and known unsupported behavior in `specs/site/*.spec.yml`.
9. Run `npm run quality:check` before handing off.

## Design Rules

- Do not mix site selector logic into CLI parsing.
- Do not remove the stealth launch baseline unless the target site is owned and you have confirmed it breaks required functionality.
- Do not paper over brittle flows with ad hoc sleeps; use the profile-backed interaction pacing options when you need hover, scroll, or key/click delays.
- Do not add cloud-browser or CAPTCHA-solving assumptions to the generic template; keep it local-first unless a specific project explicitly needs more.
- Do not model session requirements as a global boolean; attach them to a site and session profile.
- Do not collapse multiple websites or accounts into one auth profile; model separate auth profiles and require `--site` or `--auth-profile` when ambiguous.
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
npm run dev -- auth login --site example
npm run dev -- auth logout --site example
npm run dev -- profile show --site example
npm run dev -- profile clone "$HOME/Library/Application Support/Google/Chrome" --site example --source-profile-directory Default
npm run dev -- --headless search "query"
npm run dev -- session-export ./session.json
npm run dev -- session-import ./session.json
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"system.describe"}' | npm run dev -- rpc
npm run quality:check
npm run release:preflight
```
