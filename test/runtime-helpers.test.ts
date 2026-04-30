import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { resolveChromeExecutablePath } from '../src/shared/runtime/chromeExecutable.js'
import { findNearestPackageRoot } from '../src/shared/runtime/projectRoot.js'

test('findNearestPackageRoot resolves a package root from a nested directory', () => {
  const root = findNearestPackageRoot(new URL('../src/interfaces/cli', import.meta.url).pathname)
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { name?: string }

  assert.equal(packageJson.name, readCurrentPackageName())
})

test('resolveChromeExecutablePath prefers explicit path over CHROME_PATH', () => {
  const previous = process.env.CHROME_PATH
  try {
    process.env.CHROME_PATH = '/env/chrome'
    assert.equal(resolveChromeExecutablePath('/explicit/chrome'), '/explicit/chrome')
  } finally {
    restoreEnvValue('CHROME_PATH', previous)
  }
})

test('resolveChromeExecutablePath falls back to CHROME_PATH', () => {
  const previous = process.env.CHROME_PATH
  try {
    process.env.CHROME_PATH = '/env/chrome'
    assert.equal(resolveChromeExecutablePath(undefined), '/env/chrome')
  } finally {
    restoreEnvValue('CHROME_PATH', previous)
  }
})

function readCurrentPackageName(): string | undefined {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { name?: string }
  return packageJson.name
}

function restoreEnvValue(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}
