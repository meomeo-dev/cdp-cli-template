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

test('managed browser flow may reuse the initial blank page it owns', () => {
  const launchSection = source.slice(
    source.indexOf('async function launchBrowser'),
    source.indexOf('async function acquirePage'),
  )

  assert.match(launchSection, /acquirePage\(browser\)/)
})
