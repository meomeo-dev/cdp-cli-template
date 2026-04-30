import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { z } from 'zod'
import { describeSystem } from '../../application/usecases/describeSystem.js'
import { inspectHome } from '../../application/usecases/inspectHome.js'
import { searchSite } from '../../application/usecases/searchSite.js'
import type { BrowserRuntimeOptions } from '../../infrastructure/browser/browserRuntime.js'
import type { SiteAdapter } from '../../infrastructure/site/siteAdapter.js'
import { RuntimeFailure, serializeError } from '../../shared/errors/runtimeFailure.js'

const requestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.unknown().optional(),
})

const searchParamsSchema = z.object({
  query: z.string().min(1),
})

export type JsonRpcServerOptions = {
  packageName: string
  packageVersion: string
  adapter: SiteAdapter
  browserOptions: BrowserRuntimeOptions
}

export async function runJsonRpcServer(options: JsonRpcServerOptions): Promise<void> {
  const input = createInterface({ input: stdin })

  for await (const line of input) {
    if (line.trim() === '') {
      continue
    }

    const response = await handleJsonRpcLine(options, line)
    stdout.write(`${JSON.stringify(response)}\n`)
  }
}

export async function handleJsonRpcLine(options: JsonRpcServerOptions, line: string): Promise<unknown> {
  try {
    const parsed = requestSchema.parse(JSON.parse(line))
    const result = await dispatch(options, parsed.method, parsed.params)
    return {
      jsonrpc: '2.0',
      id: parsed.id ?? null,
      result,
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: null,
      error: serializeRpcError(error),
    }
  }
}

async function dispatch(
  options: JsonRpcServerOptions,
  method: string,
  params: unknown,
): Promise<unknown> {
  switch (method) {
    case 'system.describe':
      return describeSystem(options.packageName, options.packageVersion, options.adapter.config)
    case 'site.inspectHome':
      return inspectHome(options.adapter, options.browserOptions)
    case 'site.search': {
      const parsedParams = searchParamsSchema.parse(params)
      return searchSite(options.adapter, options.browserOptions, parsedParams.query)
    }
    default:
      throw new RuntimeFailure('RPC_METHOD_NOT_FOUND', `Unknown RPC method: ${method}`, { method })
  }
}

function serializeRpcError(error: unknown): { code: number; message: string; data: Record<string, unknown> } {
  const data = serializeError(error)
  const runtimeCode = typeof data.code === 'string' ? data.code : undefined
  const code = runtimeCode === 'RPC_METHOD_NOT_FOUND' ? -32601 : -32000
  return {
    code,
    message: String(data.message ?? 'RPC error'),
    data,
  }
}
