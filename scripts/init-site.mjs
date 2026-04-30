import { readFileSync, writeFileSync } from 'node:fs'

const [packageName, binName, siteName, siteUrl] = process.argv.slice(2)
if (!packageName || !binName || !siteName || !siteUrl) {
  console.error('Usage: node scripts/init-site.mjs <package-name> <bin-name> <site-name> <site-url>')
  process.exit(1)
}

updateJson('package.json', data => {
  data.name = packageName
  data.description = `CDP CLI for ${siteName}.`
  data.bin = { [binName]: 'dist/src/cli.js' }
  return data
})
replaceInFile('README.md', /site-cdp/g, binName)
replaceInFile('README.md', /CDP CLI Template/g, `${siteName} CDP CLI`)
replaceInFile('SKILL.md', /CDP CLI Template/g, `${siteName} CDP CLI`)
replaceInFile('src/interfaces/cli/program.ts', /\.name\('site-cdp'\)/, `.name('${binName}')`)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /id: 'example'/, `id: '${packageName.replace(/[^a-z0-9-]/gi, '-')}'`)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /name: 'Example Site'/, `name: '${siteName}'`)
replaceInFile('src/infrastructure/site/siteRegistry.ts', /baseUrl: 'https:\/\/example\.com\/'/, `baseUrl: '${siteUrl}'`)

console.log(`Initialized ${packageName} (${binName}) for ${siteName}: ${siteUrl}`)

function updateJson(path, update) {
  const data = JSON.parse(readFileSync(path, 'utf8'))
  writeFileSync(path, `${JSON.stringify(update(data), null, 2)}\n`, 'utf8')
}

function replaceInFile(path, pattern, replacement) {
  const before = readFileSync(path, 'utf8')
  writeFileSync(path, before.replace(pattern, replacement), 'utf8')
}
