import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { describeSystem } from '../../application/usecases/describeSystem.js'
import { inspectNetwork } from '../../application/usecases/inspectNetwork.js'
import { listEndpoints } from '../../application/usecases/listEndpoints.js'
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
    .description('Template CLI for automating one or more websites through Chrome DevTools Protocol.')
    .version(metadata.version)
    .enablePositionalOptions()
    .showHelpAfterError()

  addCommonOptions(program)

  program
    .command('describe')
    .description('Describe configured sites, auth profiles, workflows, CLI commands, and RPC methods.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => describeSystem(metadata.name, metadata.version, registry.config))
    })

  program
    .command('sites')
    .description('List configured sites and their auth requirements.')
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

  program
    .command('endpoints')
    .description('List known API endpoints and their evidence status.')
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
        return inspectHome(adapter, parseBrowserOptions(program.optsWithGlobals()))
      })
    })

  program
    .command('inspect-network')
    .description('Open a target site and record sanitized network endpoint observations.')
    .option('--site <siteId>', 'Site id to inspect; defaults to the registry default site')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => {
        const adapter = registry.createAdapter(options.site)
        return inspectNetwork(adapter, parseBrowserOptions(program.optsWithGlobals()), endpointCatalog)
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
        return searchSite(adapter, parseBrowserOptions(program.optsWithGlobals()), query)
      })
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
        browserOptions: parseBrowserOptions(program.optsWithGlobals()),
      })
    })

  return program
}

function addCommonOptions(program: Command): void {
  program
    .option('--cdp-url <url>', 'Attach to an existing Chrome CDP endpoint, e.g. http://127.0.0.1:9222')
    .option('--chrome-path <path>', 'Chrome/Chromium executable path for launching a managed browser')
    .option('--user-data-dir <path>', 'User data directory for launched browser profile')
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
