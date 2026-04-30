import type { SiteRegistryConfig } from '../../infrastructure/site/siteAdapter.js'

export type SystemDescription = {
  name: string
  version: string
  registry: SiteRegistryConfig
  site: SiteRegistryConfig['sites'][number]
  commands: string[]
  rpcMethods: string[]
  browser: {
    acceptsCdpUrl: boolean
    acceptsChromePath: boolean
    acceptsUserDataDir: boolean
    supportsSharedUserDataDir: boolean
  }
}

export function describeSystem(
  name: string,
  version: string,
  registry: SiteRegistryConfig,
): SystemDescription {
  return {
    name,
    version,
    registry,
    site: resolveDefaultSite(registry),
    commands: ['describe', 'sites', 'workflows', 'endpoints', 'inspect-home', 'inspect-network', 'search', 'rpc'],
    rpcMethods: ['system.describe', 'site.list', 'workflow.list', 'endpoint.list', 'site.inspectHome', 'site.inspectNetwork', 'site.search'],
    browser: {
      acceptsCdpUrl: true,
      acceptsChromePath: true,
      acceptsUserDataDir: true,
      supportsSharedUserDataDir: true,
    },
  }
}

function resolveDefaultSite(registry: SiteRegistryConfig): SiteRegistryConfig['sites'][number] {
  const site = registry.sites.find(entry => entry.id === registry.defaultSiteId) ?? registry.sites[0]
  if (site === undefined) {
    throw new Error('Site registry must contain at least one site.')
  }
  return site
}
