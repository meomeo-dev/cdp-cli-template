import type { Page } from 'puppeteer-core'

export type SiteSelectors = {
  ready: string
  searchInput?: string | undefined
  resultItems?: string | undefined
}

export type SiteConfig = {
  id: string
  name: string
  baseUrl: string
  selectors: SiteSelectors
}

export type InspectHomeResult = {
  site: SiteConfig
  url: string
  title: string
  ready: boolean
  readySelector: string
  mode: 'attached' | 'launched'
}

export type SearchResultItem = {
  title: string
  text: string
  href?: string | undefined
}

export type SearchResult = {
  site: SiteConfig
  query: string
  url: string
  title: string
  items: SearchResultItem[]
}

export interface SiteAdapter {
  readonly config: SiteConfig
  inspectHome(page: Page, mode: 'attached' | 'launched'): Promise<InspectHomeResult>
  search(page: Page, query: string): Promise<SearchResult>
}
