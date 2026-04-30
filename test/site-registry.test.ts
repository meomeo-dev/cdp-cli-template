import assert from 'node:assert/strict'
import test from 'node:test'
import { createSiteAdapter, defaultSiteConfig, loadSiteConfigFromEnv } from '../src/infrastructure/site/siteRegistry.js'

test('default site adapter exposes example.com contract', () => {
  const adapter = createSiteAdapter()

  assert.equal(adapter.config.id, 'example')
  assert.equal(adapter.config.baseUrl, 'https://example.com/')
  assert.equal(adapter.config.selectors.ready, 'body')
})

test('site config can be supplied by environment variables', () => {
  const previous = snapshotEnv()
  try {
    process.env.SITE_ID = 'weixin-sogou'
    process.env.SITE_NAME = 'Sogou Weixin'
    process.env.SITE_BASE_URL = 'https://weixin.sogou.com/'
    process.env.SITE_READY_SELECTOR = 'body'
    process.env.SITE_SEARCH_INPUT_SELECTOR = 'input[name=query]'
    process.env.SITE_RESULT_ITEMS_SELECTOR = '.news-box li'

    const config = loadSiteConfigFromEnv()
    assert.equal(config.id, 'weixin-sogou')
    assert.equal(config.name, 'Sogou Weixin')
    assert.equal(config.baseUrl, 'https://weixin.sogou.com/')
    assert.equal(config.selectors.searchInput, 'input[name=query]')
    assert.equal(config.selectors.resultItems, '.news-box li')
  } finally {
    restoreEnv(previous)
  }
})

test('default config is valid for adapter construction', () => {
  assert.doesNotThrow(() => createSiteAdapter(defaultSiteConfig))
})

function snapshotEnv(): NodeJS.ProcessEnv {
  return { ...process.env }
}

function restoreEnv(previous: NodeJS.ProcessEnv): void {
  process.env = previous
}
