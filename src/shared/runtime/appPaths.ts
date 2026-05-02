import { readFileSync } from 'node:fs'
import { dirname, join, posix, resolve, win32 } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findNearestPackageRoot } from './projectRoot.js'

export const SITE_CDP_HOME_DIR_ENV = 'SITE_CDP_HOME_DIR'
export const DEFAULT_CDP_CLI_HOME_ROOT_NAME = '.cdp-cli'
export const DEFAULT_CHROME_PROFILE_DIRECTORY = 'Default'
export const DEFAULT_BROWSER_PROFILE_ROOT_NAME = 'browser-profile'
export const DEFAULT_BROWSER_SESSION_ROOT_NAME = 'browser-sessions'
export const DEFAULT_BROWSER_SESSION_STATE_FILE_NAME = 'browser-state.json'
export const DEFAULT_BROWSER_SESSION_USER_DATA_DIR_NAME = 'chrome-profile'
export const DEFAULT_AUTH_ROOT_NAME = 'auth'
export const DEFAULT_AUTH_STATE_FILE_NAME = 'auth-state.json'
export const DEFAULT_AUTH_CHROME_USER_DATA_DIR_NAME = 'chrome-profile'

export type ManagedAuthProfilePaths = {
  appHomeDir: string
  authDir: string
  chromeUserDataDir: string
  chromeProfileDirectory: string
  stateFile: string
}

export type ManagedBrowserSessionPaths = {
  appHomeDir: string
  sessionRootDir: string
  sessionDir: string
  chromeUserDataDir: string
  chromeProfileDirectory: string
  stateFile: string
}

export function resolveAppHomeDir(
  env: NodeJS.ProcessEnv = process.env,
  packageName = readCurrentPackageName(),
): string {
  const configuredRoot = normalizeOptionalString(env[SITE_CDP_HOME_DIR_ENV])
  if (configuredRoot !== undefined) {
    return resolve(configuredRoot)
  }

  const homeRoot = normalizeOptionalString(env.HOME ?? env.USERPROFILE)
  if (homeRoot !== undefined) {
    return join(homeRoot, DEFAULT_CDP_CLI_HOME_ROOT_NAME, sanitizePathSegment(packageName))
  }

  return resolve(readCurrentPackageRoot(), '.site-cdp')
}

export function resolveDefaultBrowserUserDataDir(
  env: NodeJS.ProcessEnv = process.env,
  packageName = readCurrentPackageName(),
): string {
  return join(resolveAppHomeDir(env, packageName), DEFAULT_BROWSER_PROFILE_ROOT_NAME)
}

export function resolveManagedAuthProfilePaths(
  profileId: string,
  env: NodeJS.ProcessEnv = process.env,
  packageName = readCurrentPackageName(),
): ManagedAuthProfilePaths {
  const appHomeDir = resolveAppHomeDir(env, packageName)
  const authDir = join(appHomeDir, DEFAULT_AUTH_ROOT_NAME, sanitizePathSegment(profileId))
  const chromeUserDataDir = join(authDir, DEFAULT_AUTH_CHROME_USER_DATA_DIR_NAME)
  return {
    appHomeDir,
    authDir,
    chromeUserDataDir,
    chromeProfileDirectory: DEFAULT_CHROME_PROFILE_DIRECTORY,
    stateFile: join(authDir, DEFAULT_AUTH_STATE_FILE_NAME),
  }
}

export function resolveManagedBrowserSessionPaths(
  sessionId: string,
  env: NodeJS.ProcessEnv = process.env,
  packageName = readCurrentPackageName(),
): ManagedBrowserSessionPaths {
  const appHomeDir = resolveAppHomeDir(env, packageName)
  const sessionRootDir = join(appHomeDir, DEFAULT_BROWSER_SESSION_ROOT_NAME)
  const sessionDir = join(sessionRootDir, sanitizePathSegment(sessionId))
  const chromeUserDataDir = join(sessionDir, DEFAULT_BROWSER_SESSION_USER_DATA_DIR_NAME)
  return {
    appHomeDir,
    sessionRootDir,
    sessionDir,
    chromeUserDataDir,
    chromeProfileDirectory: DEFAULT_CHROME_PROFILE_DIRECTORY,
    stateFile: join(sessionDir, DEFAULT_BROWSER_SESSION_STATE_FILE_NAME),
  }
}

export function isPathInside(parentPath: string, childPath: string): boolean {
  const pathApi = usesWindowsPathSyntax(parentPath) || usesWindowsPathSyntax(childPath) ? win32 : posix
  const normalizedParent = pathApi.resolve(parentPath)
  const normalizedChild = pathApi.resolve(childPath)
  const relativePath = pathApi.relative(normalizedParent, normalizedChild)
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${pathApi.sep}`) && relativePath !== '..' && !pathApi.isAbsolute(relativePath))
  )
}

export function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '') || 'site-cdp'
}

function readCurrentPackageName(): string {
  const packageJson = JSON.parse(readFileSync(resolve(readCurrentPackageRoot(), 'package.json'), 'utf8')) as {
    name?: string
  }
  return packageJson.name ?? 'site-cdp'
}

function readCurrentPackageRoot(): string {
  const currentFile = fileURLToPath(import.meta.url)
  return findNearestPackageRoot(dirname(currentFile))
}

function normalizeOptionalString(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function usesWindowsPathSyntax(path: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('\\\\')
}
