import { readFileSync, writeFileSync } from 'node:fs'

const [packageName, binName, siteName, siteUrl] = process.argv.slice(2)
if (!packageName || !binName || !siteName || !siteUrl) {
  console.error('Usage: node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>')
  process.exit(1)
}

const packageVersion = readJson('package.json').version ?? '0.1.0'

updateJson('package.json', data => {
  data.name = packageName
  data.description = `Browser QA CLI for ${siteName}.`
  data.bin = { [binName]: 'dist/src/cli.js' }
  return data
})
updateJson('package-lock.json', data => {
  data.name = packageName
  if (data.packages?.['']) {
    data.packages[''].name = packageName
    data.packages[''].bin = { [binName]: 'dist/src/cli.js' }
  }
  return data
})
replaceInFile('README.md', /cdp-cli-template/g, packageName)
replaceInFile('README.md', /site-cdp/g, binName)
replaceInFile('README.md', /Browser QA CLI Template/g, `${siteName} Browser QA CLI`)
replaceInFile('README.md', /Example Site/g, siteName)
replaceInFile('README.md', /https:\/\/example\.com\//g, siteUrl)
replaceInFile('README.md', new RegExp(`/tmp/${packageName}-${packageVersion}\\.tgz`, 'g'), `/tmp/${packageName}-${packageVersion}.tgz`)
replaceInFile('SKILL.md', /Browser QA CLI Template/g, `${siteName} Browser QA CLI`)
replaceInFile('src/interfaces/cli/program.ts', /\.name\('site-cdp'\)/, `.name('${binName}')`)
replaceInFile('src/interfaces/cli/program.ts', /cdp-cli-template/g, packageName)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /id: 'example'/, `id: '${toSiteId(packageName)}'`)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /name: 'Example Site'/, `name: '${escapeSingleQuoted(siteName)}'`)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /baseUrl: 'https:\/\/example\.com\/'/, `baseUrl: '${escapeSingleQuoted(siteUrl)}'`)
replaceInFile('test/contract/json-rpc.test.ts', /packageName: 'cdp-cli-template'/, `packageName: '${escapeSingleQuoted(packageName)}'`)
replaceInFile('test/contract/json-rpc.test.ts', /'cdp-cli-template'/g, `'${escapeSingleQuoted(packageName)}'`)
replaceInFile('test/contract/json-rpc.test.ts', /'example'/g, `'${toSiteId(packageName)}'`)
replaceInFile('test/site-registry.test.ts', /default site adapter exposes example\.com contract/, `default site adapter exposes ${escapeRegExpLabel(siteName)} contract`)
replaceInFile('test/site-registry.test.ts', /adapter\.config\.id, 'example'/, `adapter.config.id, '${toSiteId(packageName)}'`)
replaceInFile('test/site-registry.test.ts', /adapter\.config\.baseUrl, 'https:\/\/example\.com\/'/, `adapter.config.baseUrl, '${escapeSingleQuoted(siteUrl)}'`)
replaceInFile('specs/site/site-adapter.spec.yml', /id: site-adapter-template/, `id: ${toSiteId(packageName)}-site-adapter`)

console.log(`Initialized ${packageName} (${binName}) for ${siteName}: ${siteUrl}`)
console.log('Review specs/site/site-adapter.spec.yml and add site-specific e2e assertions before relying on live coverage.')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function updateJson(path, update) {
  const data = readJson(path)
  writeFileSync(path, `${JSON.stringify(update(data), null, 2)}\n`, 'utf8')
}

function replaceInFile(path, pattern, replacement) {
  const before = readFileSync(path, 'utf8')
  const after = before.replace(pattern, replacement)
  writeFileSync(path, after, 'utf8')
}

function toSiteId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function escapeSingleQuoted(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeRegExpLabel(value) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
}
