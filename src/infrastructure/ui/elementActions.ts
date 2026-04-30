import type { KeyInput, Page } from 'puppeteer-core'
import { RuntimeFailure } from '../../shared/errors/runtimeFailure.js'
import { pickFirstEnabledCandidate, snapshotElements, type ElementCandidate, type ElementQuery } from './elementIntrospection.js'

export type ElementActionResult = {
  action: 'click' | 'type' | 'press'
  target: ElementCandidate
}

export async function resolveElementOrThrow(page: Page, query: ElementQuery): Promise<ElementCandidate> {
  const snapshot = await snapshotElements(page, query)
  const candidate = pickFirstEnabledCandidate(snapshot)
  if (candidate === undefined) {
    throw new RuntimeFailure('SITE_ACTION_FAILED', 'No enabled visible element matched the requested query.', {
      query,
      candidateCount: snapshot.candidates.length,
    })
  }
  return candidate
}

export async function clickElement(page: Page, query: ElementQuery): Promise<ElementActionResult> {
  const target = await resolveElementOrThrow(page, query)
  await page.click(target.selector)
  return { action: 'click', target }
}

export async function typeIntoElement(
  page: Page,
  query: ElementQuery,
  text: string,
  options: { clearFirst?: boolean | undefined } = {},
): Promise<ElementActionResult> {
  const target = await resolveElementOrThrow(page, query)
  await page.click(target.selector, { clickCount: options.clearFirst === false ? 1 : 3 })
  await page.keyboard.type(text)
  return { action: 'type', target }
}

export async function pressKey(page: Page, key: KeyInput): Promise<{ action: 'press'; key: KeyInput }> {
  await page.keyboard.press(key)
  return { action: 'press', key }
}
