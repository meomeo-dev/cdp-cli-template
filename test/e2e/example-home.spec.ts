import { test, expect } from '@playwright/test'

test('example.com has a document title', async ({ page }) => {
  await page.goto('https://example.com/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('body')).toBeVisible()
  await expect(page).toHaveTitle(/Example Domain/)
})
