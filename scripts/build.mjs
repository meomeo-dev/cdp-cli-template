import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { build } from 'esbuild'
import JavaScriptObfuscator from 'javascript-obfuscator'

const bundlePath = 'dist/.build/cli.bundle.js'
const outputPath = 'dist/cli.js'

await rm('dist', { recursive: true, force: true })
await mkdir(dirname(bundlePath), { recursive: true })

await build({
  entryPoints: ['src/cli.ts'],
  outfile: bundlePath,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  banner: {
    js: '#!/usr/bin/env node',
  },
  minify: true,
  legalComments: 'none',
})

const bundledCode = await readFile(bundlePath, 'utf8')
const obfuscatedCode = JavaScriptObfuscator.obfuscate(bundledCode, {
  compact: true,
  controlFlowFlattening: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: [],
  target: 'node',
}).getObfuscatedCode()

await writeFile(outputPath, obfuscatedCode, { encoding: 'utf8', mode: 0o755 })
await rm('dist/.build', { recursive: true, force: true })
