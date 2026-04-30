import assert from 'node:assert/strict'
import test from 'node:test'
import { handleJsonRpcLine } from '../../src/interfaces/rpc/jsonRpcServer.js'
import { createSiteAdapter } from '../../src/infrastructure/site/siteRegistry.js'

const options = {
  packageName: 'cdp-cli-template',
  packageVersion: '0.1.0',
  adapter: createSiteAdapter(),
  browserOptions: {
    headless: true,
    timeoutMs: 1_000,
  },
}

test('system.describe returns JSON-RPC result', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'system.describe' }),
  )

  assert.equal(readProperty(response, 'jsonrpc'), '2.0')
  assert.equal(readProperty(response, 'id'), 1)
  assert.equal(readProperty(response, 'result.name'), 'cdp-cli-template')
  assert.equal(readProperty(response, 'result.site.id'), 'example')
})

test('unknown method returns method-not-found error', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 'x', method: 'missing.method' }),
  )

  assert.equal(readProperty(response, 'jsonrpc'), '2.0')
  assert.equal(readProperty(response, 'error.code'), -32601)
  assert.equal(readProperty(response, 'error.data.code'), 'RPC_METHOD_NOT_FOUND')
})

function readProperty(value: unknown, path: string): unknown {
  let current = value
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
