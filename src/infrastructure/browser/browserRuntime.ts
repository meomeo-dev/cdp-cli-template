import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { RuntimeFailure } from '../../shared/errors/runtimeFailure.js'

export type BrowserRuntimeOptions = {
  cdpUrl?: string | undefined
  executablePath?: string | undefined
  userDataDir?: string | undefined
  headless: boolean
  timeoutMs: number
}

export type BrowserLease = {
  browser: Browser
  page: Page
  close: () => Promise<void>
  mode: 'attached' | 'launched'
}

export async function withBrowserPage<T>(
  options: BrowserRuntimeOptions,
  handler: (lease: BrowserLease) => Promise<T>,
): Promise<T> {
  const lease = await openBrowserPage(options)
  try {
    return await handler(lease)
  } finally {
    await lease.close()
  }
}

async function openBrowserPage(options: BrowserRuntimeOptions): Promise<BrowserLease> {
  if (options.cdpUrl !== undefined && options.cdpUrl.trim() !== '') {
    return connectToExistingBrowser(options.cdpUrl, options.timeoutMs)
  }

  return launchBrowser(options)
}

async function connectToExistingBrowser(cdpUrl: string, timeoutMs: number): Promise<BrowserLease> {
  let browser: Browser
  try {
    browser = await puppeteer.connect({ browserURL: cdpUrl, protocolTimeout: timeoutMs })
  } catch (error) {
    throw new RuntimeFailure('BROWSER_CONNECT_FAILED', `Failed to connect to browser at ${cdpUrl}`, {
      cdpUrl,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  const page = await acquirePage(browser)
  return {
    browser,
    page,
    mode: 'attached',
    close: async () => {
      await page.close().catch(() => undefined)
      await browser.disconnect()
    },
  }
}

async function launchBrowser(options: BrowserRuntimeOptions): Promise<BrowserLease> {
  const executablePath = options.executablePath ?? process.env.CHROME_PATH
  const userDataDir = options.userDataDir ?? defaultUserDataDir()
  await mkdir(userDataDir, { recursive: true })

  let browser: Browser
  try {
    browser = await puppeteer.launch({
      userDataDir,
      headless: options.headless,
      protocolTimeout: options.timeoutMs,
      args: ['--no-first-run', '--no-default-browser-check'],
      ...(executablePath !== undefined ? { executablePath } : {}),
    })
  } catch (error) {
    throw new RuntimeFailure('BROWSER_CONNECT_FAILED', 'Failed to launch browser', {
      executablePath: executablePath ?? '<puppeteer-default>',
      userDataDir,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  const page = await acquirePage(browser)
  return {
    browser,
    page,
    mode: 'launched',
    close: async () => {
      await browser.close().catch(() => undefined)
    },
  }
}

async function acquirePage(browser: Browser): Promise<Page> {
  const pages = await browser.pages()
  const page = pages[0] ?? (await browser.newPage())
  page.setDefaultTimeout(30_000)
  page.setDefaultNavigationTimeout(60_000)
  return page
}

function defaultUserDataDir(): string {
  const currentFile = fileURLToPath(import.meta.url)
  const projectRoot = resolve(dirname(currentFile), '../../../..')
  return resolve(projectRoot, '.site-cdp/browser-profile')
}
