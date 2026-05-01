import type { BrowserRuntimeOptions } from '../../infrastructure/browser/browserRuntime.js'
import type { SiteRegistry } from '../../infrastructure/site/siteRegistry.js'
import type { BrowserInteractionConfig, BrowserProfileConfig } from '../../infrastructure/site/siteAdapter.js'
import { DEFAULT_CHROME_PROFILE_DIRECTORY, resolveManagedAuthProfilePaths } from '../../shared/runtime/appPaths.js'
import { readManagedAuthState } from '../../shared/runtime/managedAuthState.js'

export function resolveBrowserOptionsForSite(
  registry: SiteRegistry,
  browserOptions: BrowserRuntimeOptions,
  siteId?: string | undefined,
): BrowserRuntimeOptions {
  const site = registry.getSite(siteId ?? registry.config.defaultSiteId)
  const profileId = browserOptions.authProfileId ?? site.auth.profileId
  if (profileId === undefined) {
    return browserOptions
  }

  const authProfile = registry.getAuthProfile(profileId)
  const managedPaths = resolveManagedAuthProfilePaths(profileId)
  const managedState = readManagedAuthState(profileId)
  return {
    ...browserOptions,
    authProfileId: profileId,
    userDataDir:
      browserOptions.userDataDir ??
      (browserOptions.sessionId === undefined
        ? managedState?.chromeUserDataDir ?? authProfile.userDataDir ?? managedPaths.chromeUserDataDir
        : undefined),
    chromeProfileDirectory:
      browserOptions.chromeProfileDirectory ??
      (browserOptions.sessionId === undefined
        ? managedState?.chromeProfileDirectory ?? authProfile.profileDirectory ?? DEFAULT_CHROME_PROFILE_DIRECTORY
        : undefined),
    profile: mergeBrowserProfiles(authProfile.profile, browserOptions.profile),
  }
}

export function resolveBrowserOptionsForDefaultSite(
  registry: SiteRegistry,
  browserOptions: BrowserRuntimeOptions,
): BrowserRuntimeOptions {
  return resolveBrowserOptionsForSite(registry, browserOptions, registry.defaultSite.id)
}

export function mergeBrowserProfiles(
  base: BrowserProfileConfig | undefined,
  override: BrowserProfileConfig | undefined,
): BrowserProfileConfig | undefined {
  if (base === undefined) {
    return override
  }
  if (override === undefined) {
    return base
  }

  return {
    ...base,
    ...override,
    viewport: override.viewport ?? base.viewport,
    geolocation: override.geolocation ?? base.geolocation,
    extraHeaders: mergeHeaders(base.extraHeaders, override.extraHeaders),
    interaction: mergeInteraction(base.interaction, override.interaction),
  }
}

function mergeHeaders(
  base: BrowserProfileConfig['extraHeaders'],
  override: BrowserProfileConfig['extraHeaders'],
): BrowserProfileConfig['extraHeaders'] {
  if (base === undefined) {
    return override
  }
  if (override === undefined) {
    return base
  }
  return {
    ...base,
    ...override,
  }
}

function mergeInteraction(
  base: BrowserInteractionConfig | undefined,
  override: BrowserInteractionConfig | undefined,
): BrowserInteractionConfig | undefined {
  if (base === undefined) {
    return override
  }
  if (override === undefined) {
    return base
  }

  return {
    hoverBeforeClick: override.hoverBeforeClick ?? base.hoverBeforeClick,
    scrollIntoView: override.scrollIntoView ?? base.scrollIntoView,
    clickDelayMs: override.clickDelayMs ?? base.clickDelayMs,
    typeDelayMs: override.typeDelayMs ?? base.typeDelayMs,
    pressDelayMs: override.pressDelayMs ?? base.pressDelayMs,
  }
}
