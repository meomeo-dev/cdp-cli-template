import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createSiteAdapter,
  createSiteRegistry,
  defaultSiteConfig,
  loadSiteRegistryFromEnv,
} from '../src/infrastructure/site/siteRegistry.js'
import type { SiteRegistryConfig } from '../src/infrastructure/site/siteAdapter.js'

test('default site adapter exposes example.com contract', () => {
  const adapter = createSiteAdapter()

  assert.equal(adapter.config.id, 'example')
  assert.equal(adapter.config.baseUrl, 'https://example.com/')
  assert.equal(adapter.config.selectors.ready, 'body')
  assert.equal(adapter.config.auth.mode, 'none')
})

test('site registry can model multiple sites and multiple auth profiles', () => {
  const registry = createSiteRegistry(createV2exGoogleRegistryFixture())

  assert.equal(registry.defaultSite.id, 'v2ex')
  assert.equal(registry.getSite('google').auth.mode, 'none')
  assert.equal(registry.getSite('v2ex').auth.mode, 'required')
  assert.equal(registry.getAuthProfile('v2ex-main').label, 'V2EX main account')
  assert.equal(registry.config.workflows[0]?.steps.map(step => step.siteId).join(' -> '), 'google -> v2ex')
})

test('site registry rejects workflow references to unknown sites', () => {
  const config = createV2exGoogleRegistryFixture()
  config.workflows[0]?.steps.push({
    id: 'bad-step',
    siteId: 'missing',
    kind: 'open',
    description: 'Broken fixture step.',
  })

  assert.throws(() => createSiteRegistry(config), /unknown site/)
})

test('site registry rejects unknown auth profile references', () => {
  const config = createV2exGoogleRegistryFixture()
  const v2ex = config.sites.find(site => site.id === 'v2ex')
  assert.ok(v2ex)
  v2ex.auth.profileId = 'missing-profile'

  assert.throws(() => createSiteRegistry(config), /unknown auth profile/)
})

test('site registry config can be supplied by environment variables', () => {
  const previous = snapshotEnv()
  try {
    process.env.SITE_ID = 'weixin-sogou'
    process.env.SITE_NAME = 'Sogou Weixin'
    process.env.SITE_BASE_URL = 'https://weixin.sogou.com/'
    process.env.SITE_READY_SELECTOR = 'body'
    process.env.SITE_SEARCH_INPUT_SELECTOR = 'input[name=query]'
    process.env.SITE_RESULT_ITEMS_SELECTOR = '.news-box li'
    process.env.SITE_AUTH_MODE = 'optional'
    process.env.SITE_AUTH_PROFILE_ID = 'sogou-reader'
    process.env.SITE_AUTH_PROFILE_LABEL = 'Sogou reader profile'
    process.env.SITE_ROLES = 'search,content'

    const registry = loadSiteRegistryFromEnv()
    const config = registry.defaultSite
    assert.equal(config.id, 'weixin-sogou')
    assert.equal(config.name, 'Sogou Weixin')
    assert.equal(config.baseUrl, 'https://weixin.sogou.com/')
    assert.equal(config.selectors.searchInput, 'input[name=query]')
    assert.equal(config.selectors.resultItems, '.news-box li')
    assert.equal(config.auth.mode, 'optional')
    assert.equal(config.auth.profileId, 'sogou-reader')
    assert.deepEqual(config.roles, ['search', 'content'])
    assert.equal(registry.getAuthProfile('sogou-reader').label, 'Sogou reader profile')
  } finally {
    restoreEnv(previous)
  }
})

test('default config is valid for adapter construction', () => {
  assert.doesNotThrow(() => createSiteAdapter(defaultSiteConfig))
})

function createV2exGoogleRegistryFixture(): SiteRegistryConfig {
  return {
    defaultSiteId: 'v2ex',
    authProfiles: [
      {
        id: 'v2ex-main',
        label: 'V2EX main account',
        userDataDir: '/tmp/cdp-cli-v2ex-profile',
      },
    ],
    sites: [
      {
        id: 'google',
        name: 'Google Search',
        baseUrl: 'https://www.google.com/search?q=site%3Av2ex.com',
        selectors: {
          ready: 'body',
          searchInput: 'textarea[name=q], input[name=q]',
          resultItems: 'a',
        },
        auth: { mode: 'none' },
        roles: ['search'],
      },
      {
        id: 'v2ex',
        name: 'V2EX',
        baseUrl: 'https://www.v2ex.com/',
        selectors: {
          ready: 'body',
          resultItems: '.cell, .topic_content',
        },
        auth: {
          mode: 'required',
          profileId: 'v2ex-main',
          loginUrl: 'https://www.v2ex.com/signin',
          checkSelector: '#Top a[href="/signout"]',
        },
        roles: ['content', 'forum'],
      },
    ],
    workflows: [
      {
        id: 'google-to-v2ex-original',
        name: 'Google search then V2EX original',
        description: 'Use public Google search discovery, then open V2EX with an authenticated profile.',
        steps: [
          {
            id: 'discover-via-google',
            siteId: 'google',
            kind: 'search',
            description: 'Search Google for V2EX pages.',
          },
          {
            id: 'open-v2ex-original',
            siteId: 'v2ex',
            kind: 'open',
            authProfileId: 'v2ex-main',
            description: 'Open the original V2EX page using the logged-in profile.',
          },
        ],
      },
    ],
  }
}

function snapshotEnv(): NodeJS.ProcessEnv {
  return { ...process.env }
}

function restoreEnv(previous: NodeJS.ProcessEnv): void {
  process.env = previous
}
