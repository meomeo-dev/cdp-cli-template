import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { describeSystem } from '../../application/usecases/describeSystem.js'
import { inspectHome } from '../../application/usecases/inspectHome.js'
import { searchSite } from '../../application/usecases/searchSite.js'
import { createSiteAdapter, loadSiteConfigFromEnv } from '../../infrastructure/site/siteRegistry.js'
import { serializeError } from '../../shared/errors/runtimeFailure.js'
import { parseBrowserOptions, parseOutputFormat, type CommonCliOptions } from './options.js'
import { printError, printResult } from './output.js'
import { runJsonRpcServer } from '../rpc/jsonRpcServer.js'

export type PackageMetadata = {
  name: string
  version: string
}

export function createProgram(metadata: PackageMetadata): Command {
  const program = new Command()
  const siteConfig = loadSiteConfigFromEnv()
  const adapter = createSiteAdapter(siteConfig)

  program
    .name('site-cdp')
    .description('Template CLI for automating a website through Chrome DevTools Protocol.')
    .version(metadata.version)

  addCommonOptions(program)

  program
    .command('describe')
    .description('Describe the configured site, CLI commands, and RPC methods.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => describeSystem(metadata.name, metadata.version, adapter.config))
    })

  program
    .command('inspect-home')
    .description('Open the target site and verify its ready selector.')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async options => {
      await runCliAction(options, async () => inspectHome(adapter, parseBrowserOptions(program.optsWithGlobals())))
    })

  program
    .command('search')
    .description('Run the generic search action for adapters that define SITE_SEARCH_INPUT_SELECTOR.')
    .argument('<query>', 'Search query')
    .option('--format <format>', 'Output format: json or text', 'json')
    .action(async (query: string, options) => {
      await runCliAction(options, async () => searchSite(adapter, parseBrowserOptions(program.optsWithGlobals()), query))
    })

  program
    .command('rpc')
    .description('Run a JSON-RPC 2.0 server over stdin/stdout, one request per line.')
    .action(async () => {
      await runJsonRpcServer({
        packageName: metadata.name,
        packageVersion: metadata.version,
        adapter,
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
  const packageJsonPath = findPackageJson(dirname(currentFile))
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as Partial<PackageMetadata>
  return {
    name: packageJson.name ?? 'cdp-cli-template',
    version: packageJson.version ?? '0.0.0',
  }
}

function findPackageJson(startDir: string): string {
  let currentDir = startDir
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = resolve(currentDir, 'package.json')
    if (existsSync(candidate)) {
      return candidate
    }
    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      break
    }
    currentDir = parentDir
  }

  return resolve(process.cwd(), 'package.json')
}
