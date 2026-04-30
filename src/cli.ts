#!/usr/bin/env node
import { createProgram, readPackageMetadata } from './interfaces/cli/program.js'

await createProgram(readPackageMetadata()).parseAsync(process.argv)
