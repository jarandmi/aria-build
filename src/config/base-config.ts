import { join } from 'path'

import { baseDir, KeyValue, getPackageNameSync, DEFAULT_VALUES, DEFAULT_DEST } from '../utils/utils'
import { PluginOptions } from '../cli/cli'
import { terser, multiEntry, replacePlugin } from '../libs'

import { TSRollupConfig } from './ts-rollup-config'

export interface NodeResolveOptions {
  extensions?: string[]
  mainFields?: string[]
}

export interface CommonJsOptions {
  extensions?: string[]
  include?: string | string[]
  exclude?: string | string[]
}

export interface RollupConfigOutput {
  sourcemap?: boolean | string,
  file?: string,
  format?: string,
  name?: string,
  exports?: string,
  globals?: KeyValue
}

export interface RollupConfigBase {
  input?: string | string[]
  external?: string[]
  plugins?: PluginOptions
  output?: RollupConfigOutput
  resolveOpts?: NodeResolveOptions
  commonOpts?: CommonJsOptions
  replace?: KeyValue
  compress?: boolean
}

export interface CreateRollupConfigOptions {
  config: RollupConfigBase | TSRollupConfig
  name?: string
}

export interface InputOptions extends Pick<RollupConfigBase, 'external' | 'plugins' | 'input'> {
  onwarn(options: { code: string, message: string }): void
}

export interface OutputOptions extends RollupConfigOutput { }

export interface ConfigResult {
  inputOptions?: InputOptions
  outputOptions?: OutputOptions
}

export function onwarn(options: { code: string, message: string }) {
  !options.code.includes('THIS_IS_UNDEFINED') 
    && console.log('Rollup warning: ', options.message)
}

export function createRollupConfig(options: CreateRollupConfigOptions) {
  const { input, output, compress, replace } = options.config

  const plugins = (options.config.plugins ?? []) as any[]
  const external = options.config.external ?? []

  const name = options.name ?? getPackageNameSync()
  const file = output?.file 
    ? join(baseDir(), output.file)
    : join(DEFAULT_DEST, `${name}.js`)

  const minify = () => terser({
    output: { comments: false }
  })

  replace 
    && (Object.keys(replace).length > 0)
    && (plugins.unshift(replacePlugin(replace)))

  const configResult: ConfigResult = {
    inputOptions: {
      input,
      external: [
        ...external,
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS
      ],
      plugins: [
        ...(Array.isArray(input) ? [ multiEntry() ]: []),
        ...plugins,
        ...(compress ? [ minify() ]: [])
      ],
      onwarn
    },
    outputOptions: {
      sourcemap: false,
      format: 'es',
      exports: 'named',
      globals: {},
      ...(output ?? {}),
      file
    }
  }

  return configResult
}