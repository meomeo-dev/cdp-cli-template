import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { loginAuthProfile, logoutAuthProfile, cloneAuthProfile } from '../../application/usecases/authProfiles.js'
import { describeSystem } from '../../application/usecases/describeSystem.js'
import { resolveBrowserOptionsForDefaultSite, resolveBrowserOptionsForSite } from '../../application/usecases/browserOptions.js'
import { inspectNetwork } from '../../application/usecases/inspectNetwork.js'
import { listEndpoints } from '../../application/usecases/listEndpoints.js'
import { showManagedProfile } from '../../application/usecases/profileManagement.js'
import { exportSessionState, importSessionState } from '../../application/usecases/sessionState.js'
import { defaultEndpointCatalog } from '../../infrastructure/network/endpointCatalog.js'
import { inspectHome } from '../../application/usecases/inspectHome.js'
import { searchSite } from '../../application/usecases/searchSite.js'
import { loadSiteRegistryFromEnv } from '../../infrastructure/site/siteRegistry.js'
import { serializeError } from '../../shared/errors/runtimeFailure.js'
import { findNearestPackageRoot } from '../../shared/runtime/projectRoot.js'
import { parseBrowserOptions, parseOutputFormat, type CommonCliOptions } from './options.js'
import { printError, printResult } from './output.js'
import { runJsonRpcServer } from '../rpc/jsonRpcServer.js'

export type PackageMetadata = {
  name: string
  version: string
}

export function createProgram(metadata: PackageMetadata): Command {
  const program = new Command()
  const registry = loadSiteRegistryFromEnv()
  const endpointCatalog = defaultEndpointCatalog

  program
    .name('site-cdp')
    .description('Template CLI for approved-site browser QA and integration checks.')
    .version(metadata.version)
    .enablePositionalOptions()
    .showHelpAfterError()

  addCommonOptions(program)

  program
    .command('describe')
    .description('Describe configured sites, session profiles, workflows, CLI commands, and RPC methods.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => describeSystem(metadata.name, metadata.version, registry.config))
    })

  program
    .command('sites')
    .description('List configured sites and their session requirements.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => ({
        defaultSiteId: registry.config.defaultSiteId,
        sites: registry.config.sites,
        authProfiles: registry.config.authProfiles,
      }))
    })

  program
    .command('workflows')
    .description('List configured cross-site workflow plans.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => ({ workflows: registry.config.workflows }))
    })

  const auth = program
    .command('auth')
    .description('Manage dedicated local auth profiles for approved sites.')

  auth
    .command('login')
    .description('Open a dedicated local Chrome profile and wait until site login is reusable.')
    .option('--site <siteId>', 'Site id whose auth profile should be prepared')
    .option('--auth-profile <profileId>', 'Explicit auth profile id to prepare')
    .option('--url <url>', 'Override login URL; defaults to site auth.loginUrl or baseUrl')
    .option('--force', 'Remove the existing dedicated local auth profile before opening login')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () =>
        loginAuthProfile(registry, {
          siteId: options.site,
          authProfileId: options.authProfile,
          browserOptions: parseBrowserOptions(program.optsWithGlobals()),
          url: options.url,
          force: options.force === true,
        }),
      )
    })

  auth
    .command('logout')
    .description('Remove the dedicated local auth profile for one approved site/profile.')
    .option('--site <siteId>', 'Site id whose auth profile should be cleared')
    .option('--auth-profile <profileId>', 'Explicit auth profile id to clear')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () =>
        logoutAuthProfile(registry, {
          siteId: options.site,
          authProfileId: options.authProfile,
        }),
      )
    })

  const profile = program
    .command('profile')
    .description('Inspect or prepare dedicated local browser profiles.')

  profile
    .command('show')
    .description('Show the resolved local managed auth profile paths for one site/profile.')
    .option('--site <siteId>', 'Site id whose managed profile should be shown')
    .option('--auth-profile <profileId>', 'Explicit auth profile id to inspect')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () =>
        showManagedProfile(registry, {
          siteId: options.site,
          authProfileId: options.authProfile,
        }),
      )
    })

  profile
    .command('clone')
    .description('Clone a local Chrome user-data-dir into one managed auth profile.')
    .argument('<sourceUserDataDir>', 'Source Chrome user-data-dir root to clone from')
    .option('--site <siteId>', 'Target site id whose auth profile should receive the clone')
    .option('--auth-profile <profileId>', 'Explicit target auth profile id')
    .option('--source-profile-directory <name>', 'Source Chrome profile directory inside the user-data-dir, e.g. Default or Profile 4')
    .option('--force', 'Remove the existing dedicated local target profile before cloning')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async (sourceUserDataDir: string, options) => {
      await runCliAction(options, async () =>
        cloneAuthProfile(registry, {
          siteId: options.site,
          authProfileId: options.authProfile,
          sourceUserDataDir,
          sourceProfileDirectory: options.sourceProfileDirectory,
          force: options.force === true,
        }),
      )
    })

  program
    .command('endpoints')
    .description('List known endpoint metadata and evidence status.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => listEndpoints(endpointCatalog))
    })

  program
    .command('inspect-home')
    .description('Open a target site and verify its ready selector.')
    .option('--site <siteId>', 'Site id to inspect; defaults to the registry default site')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => {
        const adapter = registry.createAdapter(options.site)
        return inspectHome(
          adapter,
          resolveBrowserOptionsForSite(registry, parseBrowserOptions(program.optsWithGlobals()), options.site),
        )
      })
    })

  program
    .command('inspect-network')
    .description('Open a target site and record redacted network metadata.')
    .option('--site <siteId>', 'Site id to inspect; defaults to the registry default site')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => {
        const adapter = registry.createAdapter(options.site)
        return inspectNetwork(
          adapter,
          resolveBrowserOptionsForSite(registry, parseBrowserOptions(program.optsWithGlobals()), options.site),
          endpointCatalog,
        )
      })
    })

  program
    .command('search')
    .description('Run the generic search action for adapters that define a search input selector.')
    .argument('<query>', 'Search query')
    .option('--site <siteId>', 'Site id to search; defaults to the registry default site')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async (query: string, options) => {
      await runCliAction(options, async () => {
        const adapter = registry.createAdapter(options.site)
        return searchSite(
          adapter,
          resolveBrowserOptionsForSite(registry, parseBrowserOptions(program.optsWithGlobals()), options.site),
          query,
        )
      })
    })

  program
    .command('session-export')
    .description('Export cookies and localStorage from the current browser session to a JSON file.')
    .argument('<path>', 'Output JSON file path')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async (path: string, options) => {
      await runCliAction(options, async () =>
        exportSessionState(resolveBrowserOptionsForDefaultSite(registry, parseBrowserOptions(program.optsWithGlobals())), path),
      )
    })

  program
    .command('session-import')
    .description('Import cookies and localStorage from a JSON file into the current browser session.')
    .argument('<path>', 'Input JSON file path')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async (path: string, options) => {
      await runCliAction(options, async () =>
        importSessionState(resolveBrowserOptionsForDefaultSite(registry, parseBrowserOptions(program.optsWithGlobals())), path),
      )
    })

  program
    .command('rpc')
    .description('Run a JSON-RPC 2.0 server over stdin/stdout, one request per line.')
    .action(async () => {
      await runJsonRpcServer({
        packageName: metadata.name,
        packageVersion: metadata.version,
        registry,
        endpointCatalog,
        browserOptions: resolveBrowserOptionsForDefaultSite(registry, parseBrowserOptions(program.optsWithGlobals())),
      })
    })

  return program
}

function addCommonOptions(program: Command): void {
  program
    .option('--cdp-url <url>', 'Attach to an existing Chrome CDP endpoint, e.g. http://127.0.0.1:9222')
    .option('--chrome-path <path>', 'Chrome/Chromium executable path for launching a managed browser')
    .option('--user-data-dir <path>', 'User data directory for launched browser profile')
    .option('--chrome-profile-directory <name>', 'Chrome profile directory inside the chosen user-data-dir, e.g. Default or Profile 4')
    .option('--auth-profile <profileId>', 'Explicit auth profile id to use instead of the site default')
    .option('--proxy-server <server>', 'Proxy server for launched browser sessions, e.g. http://127.0.0.1:8080')
    .option('--user-agent <ua>', 'Override browser user agent string')
    .option('--locale <locale>', 'Preferred locale/languages, e.g. en-US,en')
    .option('--timezone-id <tz>', 'Emulated IANA timezone id, e.g. America/Los_Angeles')
    .option('--viewport <viewport>', 'Viewport as WIDTHxHEIGHT or WIDTHxHEIGHT@DEVICE_SCALE')
    .option('--geolocation <coords>', 'Geolocation as LATITUDE,LONGITUDE[,ACCURACY]')
    .option('--extra-headers <json>', 'Extra HTTP headers as a JSON object string')
    .option('--interaction-hover-before-click', 'Hover the target element before clicking or focusing it')
    .option('--interaction-scroll-into-view', 'Scroll target elements into view before clicking or typing')
    .option('--interaction-click-delay-ms <ms>', 'Delay mouseup during click actions by the given milliseconds')
    .option('--interaction-type-delay-ms <ms>', 'Delay between typed characters by the given milliseconds')
    .option('--interaction-press-delay-ms <ms>', 'Delay between keydown and keyup for key press actions')
    .option('--headless', 'Launch Chrome in headless mode when --cdp-url is not provided')
    .option('--timeout-ms <ms>', 'Browser operation timeout in milliseconds', '60000')
}

async function runCliAction(options: CommonCliOptions, action: () => Promise<unknown>): Promise<void> {
  try {
    const format = parseOutputFormat(options.format)
    const result = await action()
    printResult(result, format)
  } catch (error) {
    const serialized = serializeError(error)
    printError(serialized)
    process.exitCode = 1
  }
}

export function readPackageMetadata(): PackageMetadata {
  const currentFile = fileURLToPath(import.meta.url)
  const packageRoot = findNearestPackageRoot(dirname(currentFile))
  const packageJsonPath = resolve(packageRoot, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as Partial<PackageMetadata>
  return {
    name: packageJson.name ?? 'cdp-cli-template',
    version: packageJson.version ?? '0.0.0',
  }
}
