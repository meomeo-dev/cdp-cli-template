import pc from 'picocolors'

export type OutputFormat = 'json' | 'text'

export function printResult(value: unknown, format: OutputFormat): void {
  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
    return
  }

  if (typeof value === 'string') {
    process.stdout.write(`${value}\n`)
    return
  }

  process.stdout.write(`${renderText(value)}\n`)
}

export function printError(error: Record<string, unknown>): void {
  process.stderr.write(`${pc.red('error')} ${String(error.message ?? 'Unknown error')}\n`)
  if (typeof error.code === 'string') {
    process.stderr.write(`${pc.dim('code')} ${error.code}\n`)
  }
}

function renderText(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return String(value)
  }

  const lines: string[] = []
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue === null || typeof entryValue !== 'object') {
      lines.push(`${pc.bold(key)}: ${String(entryValue)}`)
    }
  }

  return lines.length > 0 ? lines.join('\n') : JSON.stringify(value, null, 2)
}
