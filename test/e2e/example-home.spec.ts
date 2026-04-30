import { expect, test } from '@playwright/test'
import { defaultSiteConfig } from '../../src/infrastructure/site/siteRegistry.js'

test('configured site exposes its ready selector', async ({ page }) => {
  await page.goto(defaultSiteConfig.baseUrl, { waitUntil: 'domcontentloaded' })
  await expect(page.locator(defaultSiteConfig.selectors.ready).first()).toBeVisible()
})
