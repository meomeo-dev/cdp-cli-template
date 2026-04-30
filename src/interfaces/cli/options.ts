import { RuntimeFailure } from '../../shared/errors/runtimeFailure.js'
import { parsePositiveInteger } from '../../shared/runtime/timeout.js'
import type { BrowserRuntimeOptions } from '../../infrastructure/browser/browserRuntime.js'
import type { OutputFormat } from './output.js'

export type CommonCliOptions = {
  cdpUrl?: string | undefined
  chromePath?: string | undefined
  userDataDir?: string | undefined
  headless?: boolean | undefined
  timeoutMs?: string | undefined
  format?: string | undefined
}

export function parseBrowserOptions(options: CommonCliOptions): BrowserRuntimeOptions {
  return {
    cdpUrl: emptyToUndefined(options.cdpUrl),
    executablePath: emptyToUndefined(options.chromePath ?? process.env.CHROME_PATH),
    userDataDir: emptyToUndefined(options.userDataDir),
    headless: options.headless === true,
    timeoutMs: parsePositiveInteger(options.timeoutMs, 60_000),
  }
}

export function parseOutputFormat(value: string | undefined): OutputFormat {
  if (value === undefined || value === 'json') {
    return 'json'
  }

  if (value === 'text') {
    return 'text'
  }

  throw new RuntimeFailure('INVALID_ARGUMENT', `Unsupported output format: ${value}`, {
    supported: ['json', 'text'],
  })
}

function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined
  }

  return value
}
