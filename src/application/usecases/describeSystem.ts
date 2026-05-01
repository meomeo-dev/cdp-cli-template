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
    acceptsChromeProfileDirectory: boolean
    acceptsAuthProfileSelection: boolean
    supportsSharedUserDataDir: boolean
    supportsProfileConsistency: boolean
    supportsInteractionPacing: boolean
    supportsSessionImportExport: boolean
    supportsDedicatedManagedAuthProfiles: boolean
    supportsProfileClone: boolean
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
    commands: [
      'describe',
      'sites',
      'workflows',
      'auth login',
      'auth logout',
      'profile show',
      'profile clone',
      'endpoints',
      'inspect-home',
      'inspect-network',
      'search',
      'session-export',
      'session-import',
      'rpc',
    ],
    rpcMethods: [
      'system.describe',
      'site.list',
      'workflow.list',
      'browser.authProfileShow',
      'browser.authLogin',
      'browser.authLogout',
      'browser.profileClone',
      'endpoint.list',
      'site.inspectHome',
      'site.inspectNetwork',
      'site.search',
      'browser.sessionExport',
      'browser.sessionImport',
    ],
    browser: {
      acceptsCdpUrl: true,
      acceptsChromePath: true,
      acceptsUserDataDir: true,
      acceptsChromeProfileDirectory: true,
      acceptsAuthProfileSelection: true,
      supportsSharedUserDataDir: true,
      supportsProfileConsistency: true,
      supportsInteractionPacing: true,
      supportsSessionImportExport: true,
      supportsDedicatedManagedAuthProfiles: true,
      supportsProfileClone: true,
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
