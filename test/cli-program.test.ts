import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('src/interfaces/cli/program.ts', 'utf8')

test('CLI program exposes auth and profile management commands', () => {
  assert.match(source, /\.command\('auth'\)/)
  assert.match(source, /\.command\('login'\)/)
  assert.match(source, /\.command\('logout'\)/)
  assert.match(source, /\.command\('profile'\)/)
  assert.match(source, /\.command\('show'\)/)
  assert.match(source, /\.command\('clone'\)/)
})

test('CLI program exposes managed browser session commands', () => {
  assert.match(source, /\.command\('browser'\)/)
  assert.match(source, /\.command\('list'\)/)
  assert.match(source, /\.command\('stop'\)/)
  assert.match(source, /listBrowserSessions\(\)/)
  assert.match(source, /stopBrowserSession\(session/)
})

test('CLI program exposes auth profile and chrome profile selection options', () => {
  assert.match(source, /--auth-profile <profileId>/)
  assert.match(source, /--session <slug>/)
  assert.match(source, /--chrome-profile-directory <name>/)
  assert.match(source, /--source-profile-directory <name>/)
  assert.match(source, /--headed/)
})

test('CLI program checks required auth readiness for site interaction commands', () => {
  assert.match(source, /required: true/)
  assert.match(source, /resolveBrowserOptionsForSite\(registry, parseBrowserOptions\(program\.optsWithGlobals\(\)\), options\.site/)
})
