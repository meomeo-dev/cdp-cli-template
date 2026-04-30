import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const requiredFiles = ['README.md', 'SKILL.md', 'dist/src/cli.js']
const failures = []

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing required package file: ${file}`)
  }
}

if (!packageJson.bin || typeof packageJson.bin !== 'object') {
  failures.push('package.json must define a bin object')
}

const pack = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
})

if (pack.status !== 0) {
  failures.push(`npm pack --dry-run failed: ${pack.stderr || pack.stdout}`)
} else {
  const packed = JSON.parse(pack.stdout)[0]
  if (!packed || packed.entryCount <= 0) {
    failures.push('npm pack dry-run returned no entries')
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('package:verify passed.')
