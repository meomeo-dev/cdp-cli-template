import { mkdir } from 'node:fs/promises'
import vanillaPuppeteer, { type Browser, type CookieData, type Page, type Viewport } from 'puppeteer-core'
import { addExtra, type VanillaPuppeteer } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import type { BrowserProfileConfig } from '../site/siteAdapter.js'
import {
  resolveHeadlessDesktopFingerprint,
  sanitizeHeadlessUserAgent,
  type HeadlessDesktopFingerprint,
} from './headlessFingerprint.js'
import { setPageInteractionProfile } from '../ui/interactionProfile.js'
import { RuntimeFailure } from '../../shared/errors/runtimeFailure.js'
import { resolveDefaultBrowserUserDataDir } from '../../shared/runtime/appPaths.js'
import { resolveChromeExecutablePath } from '../../shared/runtime/chromeExecutable.js'

const puppeteer = addExtra(createPuppeteerExtraAdapter())
puppeteer.use(StealthPlugin())

export type BrowserRuntimeOptions = {
  cdpUrl?: string | undefined
  executablePath?: string | undefined
  userDataDir?: string | undefined
  chromeProfileDirectory?: string | undefined
  authProfileId?: string | undefined
  initialUrl?: string | undefined
  headless: boolean
  timeoutMs: number
  profile?: BrowserProfileConfig | undefined
}

export type BrowserLease = {
  browser: Browser
  page: Page
  close: () => Promise<void>
  mode: 'attached' | 'launched'
}

export type BrowserSessionSnapshot = {
  cookies: CookieData[]
  origins: Array<{
    origin: string
    localStorage: Record<string, string>
  }>
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
    return connectToExistingBrowser(options.cdpUrl, options.timeoutMs, options.profile, options.initialUrl)
  }

  return launchBrowser(options)
}

async function connectToExistingBrowser(
  cdpUrl: string,
  timeoutMs: number,
  profile: BrowserProfileConfig | undefined,
  initialUrl: string | undefined,
): Promise<BrowserLease> {
  let browser: Browser
  try {
    browser = await puppeteer.connect({ browserURL: cdpUrl, protocolTimeout: timeoutMs })
  } catch (error) {
    throw new RuntimeFailure('BROWSER_CONNECT_FAILED', `Failed to connect to browser at ${cdpUrl}`, {
      cdpUrl,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  const page = await browser.newPage()
  await applyBrowserProfile(page, browser, profile, initialUrl)
  return {
    browser,
    page,
    mode: 'attached',
    close: async () => {
      await closePageQuietly(page)
      browser.disconnect()
    },
  }
}

async function launchBrowser(options: BrowserRuntimeOptions): Promise<BrowserLease> {
  const executablePath = resolveChromeExecutablePath(options.executablePath)
  const userDataDir = options.userDataDir ?? defaultUserDataDir()
  const headlessFingerprint = options.headless ? resolveHeadlessDesktopFingerprint(options.profile) : undefined
  await mkdir(userDataDir, { recursive: true })

  let browser: Browser
  try {
    browser = await puppeteer.launch({
      userDataDir,
      headless: options.headless,
      ...(headlessFingerprint !== undefined ? { defaultViewport: headlessFingerprint.viewport } : {}),
      protocolTimeout: options.timeoutMs,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
        ...(options.chromeProfileDirectory !== undefined ? [`--profile-directory=${options.chromeProfileDirectory}`] : []),
        ...(options.profile?.proxyServer !== undefined ? [`--proxy-server=${options.profile.proxyServer}`] : []),
      ],
      ...(executablePath !== undefined ? { executablePath } : {}),
    })
  } catch (error) {
    throw new RuntimeFailure('BROWSER_CONNECT_FAILED', 'Failed to launch browser', {
      executablePath: executablePath ?? '<not-found: set --chrome-path or CHROME_PATH>',
      userDataDir,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  const page = await acquirePage(browser)
  await applyHeadlessDesktopFingerprint(page, browser, headlessFingerprint)
  await applyBrowserProfile(page, browser, options.profile, options.initialUrl, headlessFingerprint)
  return {
    browser,
    page,
    mode: 'launched',
    close: async () => {
      await browser.close()
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

async function closePageQuietly(page: Page): Promise<void> {
  try {
    if (!page.isClosed()) {
      await page.close()
    }
  } catch {
    // Attached browsers are owned by the caller; page cleanup is best effort only.
  }
}

function defaultUserDataDir(): string {
  return resolveDefaultBrowserUserDataDir()
}

export async function exportBrowserSession(page: Page): Promise<BrowserSessionSnapshot> {
  const cookies = await page.cookies()
  const origins = await page.evaluate(() => {
    const origin = window.location.origin
    const entries = Object.fromEntries(
      Array.from({ length: window.localStorage.length }, (_, index) => {
        const key = window.localStorage.key(index)
        return key === null ? null : [key, window.localStorage.getItem(key) ?? '']
      }).filter((entry): entry is [string, string] => entry !== null),
    )
    return [{ origin, localStorage: entries }]
  })

  return { cookies, origins }
}

export async function importBrowserSession(page: Page, snapshot: BrowserSessionSnapshot): Promise<void> {
  if (snapshot.cookies.length > 0) {
    await page.setCookie(...snapshot.cookies)
  }

  if (snapshot.origins.length === 0) {
    return
  }

  const initialUrl = page.url()
  for (const originState of snapshot.origins) {
    const targetUrl = originToNavigableUrl(originState.origin)
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
    await page.evaluate(entries => {
      window.localStorage.clear()
      for (const [key, value] of Object.entries(entries)) {
        window.localStorage.setItem(key, value)
      }
    }, originState.localStorage)
  }

  if (initialUrl !== 'about:blank') {
    await page.goto(initialUrl, { waitUntil: 'domcontentloaded' })
  }
}

function createPuppeteerExtraAdapter(): VanillaPuppeteer {
  return {
    connect: (options: Parameters<typeof vanillaPuppeteer.connect>[0]) => vanillaPuppeteer.connect(options),
    defaultArgs: (options: Parameters<typeof vanillaPuppeteer.defaultArgs>[0]) => vanillaPuppeteer.defaultArgs(options),
    executablePath: () => vanillaPuppeteer.executablePath(),
    launch: (options: Parameters<typeof vanillaPuppeteer.launch>[0]) => vanillaPuppeteer.launch(options),
    createBrowserFetcher: () => {
      throw new Error('createBrowserFetcher is not supported by this puppeteer-core runtime adapter.')
    },
  }
}

async function applyBrowserProfile(
  page: Page,
  browser: Browser,
  profile: BrowserProfileConfig | undefined,
  initialUrl: string | undefined,
  headlessFingerprint?: HeadlessDesktopFingerprint | undefined,
): Promise<void> {
  setPageInteractionProfile(page, profile?.interaction)

  if (headlessFingerprint !== undefined) {
    await applyHeadlessNavigatorFingerprint(page, profile?.userAgent)
  }

  if (profile === undefined) {
    return
  }

  if (profile.extraHeaders !== undefined) {
    await page.setExtraHTTPHeaders(profile.extraHeaders)
  }

  if (profile.userAgent !== undefined) {
    await page.setUserAgent({
      userAgent: headlessFingerprint !== undefined ? sanitizeHeadlessUserAgent(profile.userAgent) : profile.userAgent,
    })
  }

  if (profile.viewport !== undefined) {
    await page.setViewport(toViewport(profile.viewport))
  }

  if (profile.timezoneId !== undefined) {
    await page.emulateTimezone(profile.timezoneId)
  }

  if (profile.locale !== undefined) {
    await page.evaluateOnNewDocument(locale => {
      const languages = locale.split(',').map(value => value.trim()).filter(Boolean)
      Object.defineProperty(navigator, 'language', {
        configurable: true,
        get: () => languages[0] ?? locale,
      })
      Object.defineProperty(navigator, 'languages', {
        configurable: true,
        get: () => (languages.length > 0 ? languages : [locale]),
      })
    }, profile.locale)
  }

  if (profile.geolocation !== undefined) {
    if (initialUrl !== undefined) {
      await browser.defaultBrowserContext().overridePermissions(new URL(initialUrl).origin, ['geolocation'])
    }
    await page.setGeolocation({
      latitude: profile.geolocation.latitude,
      longitude: profile.geolocation.longitude,
      ...(profile.geolocation.accuracy !== undefined ? { accuracy: profile.geolocation.accuracy } : {}),
    })
  }
}

async function applyHeadlessDesktopFingerprint(
  page: Page,
  browser: Browser,
  headlessFingerprint: HeadlessDesktopFingerprint | undefined,
): Promise<void> {
  if (headlessFingerprint === undefined) {
    return
  }

  const windowId = await page.windowId()
  await browser.setWindowBounds(windowId, {
    width: headlessFingerprint.windowBounds.width,
    height: headlessFingerprint.windowBounds.height,
  })
  await page.evaluateOnNewDocument(screenMetrics => {
    const define = <K extends keyof Screen>(name: K, value: Screen[K]) => {
      Object.defineProperty(window.screen, name, {
        configurable: true,
        get: () => value,
      })
    }

    define('width', screenMetrics.width)
    define('height', screenMetrics.height)
    define('availWidth', screenMetrics.availWidth)
    define('availHeight', screenMetrics.availHeight)
    define('colorDepth', screenMetrics.colorDepth)
    define('pixelDepth', screenMetrics.pixelDepth)
    Object.defineProperty(window.screen, 'availLeft', {
      configurable: true,
      get: () => screenMetrics.availLeft,
    })
    Object.defineProperty(window.screen, 'availTop', {
      configurable: true,
      get: () => screenMetrics.availTop,
    })
  }, headlessFingerprint.screen)
}

async function applyHeadlessNavigatorFingerprint(page: Page, userAgent?: string | undefined): Promise<void> {
  const resolvedUserAgent = sanitizeHeadlessUserAgent(userAgent ?? (await page.browser().userAgent()))
  await page.setUserAgent({ userAgent: resolvedUserAgent })
}

function toViewport(viewport: NonNullable<BrowserProfileConfig['viewport']>): Viewport {
  return {
    width: viewport.width,
    height: viewport.height,
    ...(viewport.deviceScaleFactor !== undefined ? { deviceScaleFactor: viewport.deviceScaleFactor } : {}),
    ...(viewport.isMobile !== undefined ? { isMobile: viewport.isMobile } : {}),
    ...(viewport.hasTouch !== undefined ? { hasTouch: viewport.hasTouch } : {}),
    ...(viewport.isLandscape !== undefined ? { isLandscape: viewport.isLandscape } : {}),
  }
}

function originToNavigableUrl(origin: string): string {
  const url = new URL(origin)
  url.pathname = '/'
  url.search = ''
  url.hash = ''
  return url.toString()
}
