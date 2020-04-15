import { dirname, join, sep, basename } from 'path'
import { existsSync } from 'fs'

import { TSRollupConfig } from '../config/config'
import { rename, globFiles, writeFile } from '../fs/fs'

import { getPackageName } from './get-package'
import { getInputEntryFile, DEFAULT_DEST } from './common'

export interface RenameDtsEntryOptions {
  config: TSRollupConfig | TSRollupConfig[],
  name?: string | string[]
  entry?: string
}

export async function createEntryFile(outDir: string, name: string) {
  const files = await globFiles(`./${outDir}/**/*.d.ts`, true)
  const dtsFiles = files.map(file => {
    const value = `.${sep}${basename(file, '.d.ts')}`
    return `export * from '${value}'`
  })
  const outfile = join(outDir, `${name}.d.ts`)
  await writeFile(outfile, dtsFiles.join('\n'))
  return name
}

export async function renameDtsFile(options: RenameDtsEntryOptions) {
  const config = options.config as TSRollupConfig
  config.input = options.entry ?? config.input  

  const { output, input } = config
  const outDir = output?.file ? dirname(output.file): DEFAULT_DEST
  const name = options.name ?? await getPackageName()

  const inputEntry = Array.isArray(input) 
    ? await createEntryFile(outDir, name)
    : getInputEntryFile(input)

  const dtsInputFileName = inputEntry + '.d.ts'  
  const inputFullPath = join(outDir, dtsInputFileName)

  const destFullPath = join(outDir, 
    ([ name, 'index'].includes(inputEntry))
      ? name + '.d.ts'
      : dtsInputFileName
  )

  !existsSync(destFullPath)
    && await rename(inputFullPath, destFullPath)
}

export async function renameDtsEntryFile(options: RenameDtsEntryOptions) {
  const configs = Array.isArray(options.config) 
    ? options.config
    : [ options.config ]

  const config = configs.find(option => {
    return option.tsconfig?.compilerOptions?.declaration
  })

  config && await renameDtsFile({ ...options, config })
}