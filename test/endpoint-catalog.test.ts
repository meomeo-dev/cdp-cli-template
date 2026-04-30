import assert from 'node:assert/strict'
import test from 'node:test'
import {
  listEndpointCatalog,
  matchEndpointRecord,
  matchesUrlPattern,
  type EndpointCatalog,
} from '../src/infrastructure/network/endpointCatalog.js'

test('endpoint catalog lists configured API endpoint records', () => {
  const catalog = createCatalogFixture()

  assert.deepEqual(listEndpointCatalog(catalog).map(record => record.id), ['search-api'])
})

test('endpoint catalog matches by method and wildcard URL pattern', () => {
  const catalog = createCatalogFixture()

  assert.equal(
    matchEndpointRecord(catalog, {
      method: 'GET',
      url: 'https://www.google.com/search?q=v2ex',
    })?.id,
    'search-api',
  )
  assert.equal(
    matchEndpointRecord(catalog, {
      method: 'POST',
      url: 'https://www.google.com/search?q=v2ex',
    }),
    undefined,
  )
})

test('endpoint URL patterns support path, wildcard, and regex styles', () => {
  assert.equal(matchesUrlPattern('https://example.com/api/search?q=x', '/api/search'), true)
  assert.equal(matchesUrlPattern('https://example.com/api/search?q=x', 'https://example.com/api/search'), true)
  assert.equal(matchesUrlPattern('https://example.com/api/search?q=x', 'https://example.com/api/*'), true)
  assert.equal(matchesUrlPattern('https://example.com/api/search?q=x', 'regex:/api/search'), true)
})

function createCatalogFixture(): EndpointCatalog {
  return {
    records: [
      {
        id: 'search-api',
        method: 'GET',
        urlPattern: 'https://www.google.com/search*',
        category: 'search',
        evidenceStatus: 'observed',
        description: 'Search result page request used as a discovery endpoint.',
        siteIds: ['google'],
      },
    ],
  }
}
