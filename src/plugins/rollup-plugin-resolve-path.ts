import { join, dirname } from 'path'
import { existsSync, statSync } from 'fs'

export function pathResolver(extensions?: string[]) {
  const _extensions = [ 'ts', 'js', 'tsx', 'jsx', ...(extensions ?? []) ] 

  const resolveFile = (resolved: string, index: boolean = false) => {
    for (const extension of _extensions) {
      const file = index 
        ? join(resolved, `index.${extension}`)
        : `${resolved}.${extension}`
      if (existsSync(file)) return file
    }
  }

  return function resolveId(id: string, origin: string | undefined) {
    if (!origin) return id
    const resolved = join(dirname(origin), id)
    const file = resolveFile(resolved)
    if (file) return file
    if (existsSync(resolved) && statSync(resolved).isDirectory()) {
      const coreFile = resolveFile(resolved, true)
      if (coreFile) return coreFile
    }
  }
}

/* istanbul ignore next */
export function resolvePathPlugin(extenstions?: string[]) {
  return {
    name: 'resolve-path',
    resolveId: pathResolver(extenstions)
  }
}