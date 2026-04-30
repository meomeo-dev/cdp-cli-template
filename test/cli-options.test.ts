import assert from 'node:assert/strict'
import test from 'node:test'
import { parseBrowserOptions, parseOutputFormat } from '../src/interfaces/cli/options.js'
import { RuntimeFailure } from '../src/shared/errors/runtimeFailure.js'

test('parseBrowserOptions normalizes common CLI options', () => {
  const options = parseBrowserOptions({
    cdpUrl: 'http://127.0.0.1:9222',
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/site-cdp',
    headless: true,
    timeoutMs: '12345',
  })

  assert.equal(options.cdpUrl, 'http://127.0.0.1:9222')
  assert.equal(options.executablePath, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
  assert.equal(options.userDataDir, '/tmp/site-cdp')
  assert.equal(options.headless, true)
  assert.equal(options.timeoutMs, 12345)
})

test('parseOutputFormat accepts json and text only', () => {
  assert.equal(parseOutputFormat(undefined), 'json')
  assert.equal(parseOutputFormat('json'), 'json')
  assert.equal(parseOutputFormat('text'), 'text')

  assert.throws(
    () => parseOutputFormat('yaml'),
    error => error instanceof RuntimeFailure && error.code === 'INVALID_ARGUMENT',
  )
})
