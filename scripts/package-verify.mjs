import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const requiredFiles = ['README.md', 'SKILL.md', 'dist/cli.js']
const expectedPackageFiles = new Set(['CHANGELOG.md', 'README.md', 'SKILL.md', 'dist/cli.js', 'package.json'])
const disallowedPackagePrefixes = ['dist/src/', 'dist/test/', 'test/', 'specs/', 'scripts/', 'src/']
const failures = []

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing required package file: ${file}`)
  }
}

if (!packageJson.bin || typeof packageJson.bin !== 'object') {
  failures.push('package.json must define a bin object')
} else {
  for (const [name, path] of Object.entries(packageJson.bin)) {
    if (path !== 'dist/cli.js') {
      failures.push(`package.json bin ${name} must point to dist/cli.js`)
    }
  }
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

  const packedFiles = packed?.files?.map(entry => entry.path) ?? []
  const unexpectedFiles = packedFiles.filter(path => !expectedPackageFiles.has(path))
  const missingFiles = [...expectedPackageFiles].filter(path => !packedFiles.includes(path))
  if (unexpectedFiles.length > 0) {
    failures.push(`package includes unexpected files: ${unexpectedFiles.join(', ')}`)
  }
  if (missingFiles.length > 0) {
    failures.push(`package is missing expected files: ${missingFiles.join(', ')}`)
  }

  for (const prefix of disallowedPackagePrefixes) {
    const matched = packedFiles.filter(path => path.startsWith(prefix))
    if (matched.length > 0) {
      failures.push(`package includes disallowed ${prefix} files: ${matched.join(', ')}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('package:verify passed.')
