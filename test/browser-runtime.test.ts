import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('src/infrastructure/browser/browserRuntime.ts', 'utf8')

test('attached browser flow opens a temporary page instead of reusing caller pages', () => {
  const connectSection = source.slice(
    source.indexOf('async function connectToExistingBrowser'),
    source.indexOf('async function launchBrowser'),
  )

  assert.match(connectSection, /browser\.newPage\(\)/)
  assert.doesNotMatch(connectSection, /acquirePage\(browser\)/)
})

test('attached browser flow applies browser profile settings to the temporary page', () => {
  assert.match(source, /connectToExistingBrowser\(options\.cdpUrl, options\.timeoutMs, options\.profile, options\.initialUrl\)/)
  assert.match(source, /await applyBrowserProfile\(page, browser, profile, initialUrl\)/)
})

test('managed browser flow may reuse the initial blank page it owns', () => {
  const launchSection = source.slice(
    source.indexOf('async function launchBrowser'),
    source.indexOf('async function acquirePage'),
  )

  assert.match(launchSection, /acquirePage\(browser\)/)
})

test('managed browser flow enables stealth defaults for owned launches', () => {
  assert.match(source, /addExtra\(createPuppeteerExtraAdapter\(\)\)/)
  assert.match(source, /function createPuppeteerExtraAdapter\(\): VanillaPuppeteer/)
  assert.match(source, /StealthPlugin\(\)/)
  assert.match(source, /ignoreDefaultArgs: \['--enable-automation'\]/)
  assert.match(source, /--disable-blink-features=AutomationControlled/)
})

test('browser runtime stores page-level interaction pacing from the resolved profile', () => {
  assert.match(source, /setPageInteractionProfile\(page, profile\?\.interaction\)/)
})

test('browser runtime can pre-authorize geolocation against the initial target origin', () => {
  assert.match(source, /initialUrl\?: string \| undefined/)
  assert.match(source, /overridePermissions\(new URL\(initialUrl\)\.origin, \['geolocation'\]\)/)
  assert.doesNotMatch(source, /currentUrl !== 'about:blank'/)
})
