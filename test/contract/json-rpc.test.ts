import assert from 'node:assert/strict'
import test from 'node:test'
import { handleJsonRpcLine } from '../../src/interfaces/rpc/jsonRpcServer.js'
import { createSiteRegistry } from '../../src/infrastructure/site/siteRegistry.js'
import type { JsonRpcServerOptions } from '../../src/interfaces/rpc/jsonRpcServer.js'

const options: JsonRpcServerOptions = {
  packageName: 'cdp-cli-template',
  packageVersion: '0.1.0',
  registry: createSiteRegistry(),
  endpointCatalog: {
    records: [
      {
        id: 'example-api',
        method: 'GET',
        urlPattern: 'https://example.com/api/*',
        category: 'api',
        evidenceStatus: 'observed',
        description: 'Example endpoint catalog record.',
      },
    ],
  },
  browserOptions: {
    headless: true,
    timeoutMs: 1_000,
  },
}

const requiredAuthOptions: JsonRpcServerOptions = {
  ...options,
  registry: createSiteRegistry({
    defaultSiteId: 'private',
    authProfiles: [
      {
        id: 'reviewer',
        label: 'Reviewer',
      },
    ],
    sites: [
      {
        id: 'private',
        name: 'Private',
        baseUrl: 'https://example.com/private',
        selectors: { ready: 'body' },
        auth: { mode: 'required', profileId: 'reviewer' },
        roles: ['primary'],
      },
    ],
    workflows: [],
  }),
}

test('system.describe returns JSON-RPC result with registry details', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'system.describe' }),
  )

  assert.equal(readProperty(response, 'jsonrpc'), '2.0')
  assert.equal(readProperty(response, 'id'), 1)
  assert.equal(readProperty(response, 'result.name'), 'cdp-cli-template')
  assert.equal(readProperty(response, 'result.site.id'), 'example')
  assert.equal(readProperty(response, 'result.registry.defaultSiteId'), 'example')
  assert.equal(readProperty(response, 'result.browser.supportsProfileConsistency'), true)
  assert.equal(readProperty(response, 'result.browser.supportsInteractionPacing'), true)
  assert.equal(readProperty(response, 'result.browser.supportsSessionImportExport'), true)
  assert.equal(readProperty(response, 'result.browser.supportsDedicatedManagedAuthProfiles'), true)
  assert.equal(readProperty(response, 'result.browser.supportsProfileClone'), true)
  assert.equal(readProperty(response, 'result.browser.acceptsManagedSession'), true)
  assert.equal(readProperty(response, 'result.browser.supportsManagedSessionList'), true)
  assert.equal(readProperty(response, 'result.browser.supportsManagedSessionStop'), true)
  assert.equal(readProperty(response, 'result.browser.defaultsCommandRunsHeadless'), true)
  assert.equal(readProperty(response, 'result.browser.checksRequiredAuthProfileReadiness'), true)
  assert.equal(readProperty(response, 'result.browser.usesUnifiedProfileRoot'), true)
  assert.equal(readProperty(response, 'result.browser.hardensManagedProfileDirectories'), true)
})

test('site.list returns auth-aware site registry', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'site.list' }),
  )

  assert.equal(readProperty(response, 'result.defaultSiteId'), 'example')
  assert.equal(readProperty(response, 'result.sites.0.auth.mode'), 'none')
})

test('workflow.list returns configured workflow plans', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'workflow.list' }),
  )

  assert.equal(readProperty(response, 'result.workflows.0.id'), 'single-site-inspect')
})


test('endpoint.list returns known endpoint catalog records', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'endpoint.list' }),
  )

  assert.equal(readProperty(response, 'result.endpoints.0.id'), 'example-api')
  assert.equal(readProperty(response, 'result.endpoints.0.evidenceStatus'), 'observed')
})

test('system.describe advertises endpoint observation surfaces', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'system.describe' }),
  )

  assert.equal(
    (readProperty(response, 'result.commands') as string[]).includes('inspect-network'),
    true,
  )
  assert.equal(
    (readProperty(response, 'result.rpcMethods') as string[]).includes('site.inspectNetwork'),
    true,
  )
  assert.equal(
    (readProperty(response, 'result.rpcMethods') as string[]).includes('browser.sessionExport'),
    true,
  )
  assert.equal(
    (readProperty(response, 'result.rpcMethods') as string[]).includes('browser.authLogin'),
    true,
  )
  assert.equal(
    (readProperty(response, 'result.commands') as string[]).includes('browser list'),
    true,
  )
  assert.equal(
    (readProperty(response, 'result.rpcMethods') as string[]).includes('browser.sessionStop'),
    true,
  )
})

test('browser.sessionList returns registered managed browser sessions', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 6, method: 'browser.sessionList' }),
  )

  assert.equal(Array.isArray(readProperty(response, 'result.sessions')), true)
})

test('site RPC methods fail clearly when required auth profile is not ready', async () => {
  const response = await handleJsonRpcLine(
    requiredAuthOptions,
    JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'site.search', params: { query: 'hello' } }),
  )

  assert.equal(readProperty(response, 'error.data.code'), 'AUTH_PROFILE_NOT_READY')
  assert.equal(readProperty(response, 'error.data.details.authProfileId'), 'reviewer')
})

test('unknown method preserves request id in JSON-RPC error', async () => {
  const response = await handleJsonRpcLine(
    options,
    JSON.stringify({ jsonrpc: '2.0', id: 'x', method: 'missing.method' }),
  )

  assert.equal(readProperty(response, 'jsonrpc'), '2.0')
  assert.equal(readProperty(response, 'id'), 'x')
  assert.equal(readProperty(response, 'error.code'), -32601)
  assert.equal(readProperty(response, 'error.data.code'), 'RPC_METHOD_NOT_FOUND')
})

test('parse errors use null request id', async () => {
  const response = await handleJsonRpcLine(options, '{not-json')

  assert.equal(readProperty(response, 'jsonrpc'), '2.0')
  assert.equal(readProperty(response, 'id'), null)
  assert.equal(readProperty(response, 'error.code'), -32000)
})

function readProperty(value: unknown, path: string): unknown {
  let current = value
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object') {
      return undefined
    }

    if (Array.isArray(current)) {
      const index = Number(part)
      current = Number.isInteger(index) ? current[index] : undefined
      continue
    }

    if (!(part in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
