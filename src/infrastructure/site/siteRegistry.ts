import { z } from 'zod'
import { GenericSiteAdapter } from './genericSiteAdapter.js'
import type { SiteAdapter, SiteConfig } from './siteAdapter.js'

const siteConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().url(),
  selectors: z.object({
    ready: z.string().min(1),
    searchInput: z.string().min(1).optional(),
    resultItems: z.string().min(1).optional(),
  }),
}) satisfies z.ZodType<SiteConfig>

export const defaultSiteConfig = siteConfigSchema.parse({
  id: 'example',
  name: 'Example Site',
  baseUrl: 'https://example.com/',
  selectors: {
    ready: 'body',
  },
})

export function createSiteAdapter(config: SiteConfig = defaultSiteConfig): SiteAdapter {
  return new GenericSiteAdapter(siteConfigSchema.parse(config))
}

export function loadSiteConfigFromEnv(): SiteConfig {
  return siteConfigSchema.parse({
    id: process.env.SITE_ID ?? defaultSiteConfig.id,
    name: process.env.SITE_NAME ?? defaultSiteConfig.name,
    baseUrl: process.env.SITE_BASE_URL ?? defaultSiteConfig.baseUrl,
    selectors: {
      ready: process.env.SITE_READY_SELECTOR ?? defaultSiteConfig.selectors.ready,
      searchInput: process.env.SITE_SEARCH_INPUT_SELECTOR,
      resultItems: process.env.SITE_RESULT_ITEMS_SELECTOR,
    },
  })
}
