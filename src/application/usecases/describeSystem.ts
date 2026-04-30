import type { SiteConfig } from '../../infrastructure/site/siteAdapter.js'

export type SystemDescription = {
  name: string
  version: string
  site: SiteConfig
  commands: string[]
  rpcMethods: string[]
  browser: {
    acceptsCdpUrl: boolean
    acceptsChromePath: boolean
    acceptsUserDataDir: boolean
  }
}

export function describeSystem(name: string, version: string, site: SiteConfig): SystemDescription {
  return {
    name,
    version,
    site,
    commands: ['describe', 'inspect-home', 'search', 'rpc'],
    rpcMethods: ['system.describe', 'site.inspectHome', 'site.search'],
    browser: {
      acceptsCdpUrl: true,
      acceptsChromePath: true,
      acceptsUserDataDir: true,
    },
  }
}
