import * as path from 'path'
import * as fs from 'fs'
import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import * as mock from 'mock-require'

import { expect } from 'aria-mocha'
import { BuildOptions, handler } from '../src'

describe('handler', () => {

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
    mock.stopAll()
  })

  it('should build with default options', async () => {
    mockfs({
      'dist': {},
      'src': {
        'mkdirp.ts': `
          import * as fs from 'fs'
          import * as path from 'path'
          
          function mkdirp(directory: string): void {
            const dirPath = path.resolve(directory).replace(/\/$/, '').split(path.sep);
            for (let i = 1; i <= dirPath.length; i++) {
              const segment = dirPath.slice(0, i).join(path.sep);
              if (!fs.existsSync(segment) && segment.length > 0) {
                fs.mkdirSync(segment);
              }
            }
          }
          
          export { mkdirp }
        `,
        'index.ts': `export * from './mkdirp'`
      },
      'package.json': `{ "name": "aria" }`,
      'README.md': ''
    })

    mock(path.resolve('package.json'), {  
      name: 'aria'
    })

    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: false,
      output: 'dist',
      watch: false,
      clean: 'dist'
    }

    await handler(options)

    expect(fs.existsSync('./dist/aria.js')).toBeTrue()
    expect(fs.existsSync('./dist/aria.es.js')).toBeTrue()
    expect(fs.existsSync('./dist/package.json')).toBeTrue()
    expect(fs.existsSync('./dist/README.md')).toBeTrue()
    expect(fs.existsSync('./dist/aria.d.ts')).toBeFalse()

    const pkgFile = './dist/package.json'
    const pkg = JSON.parse((await fs.promises.readFile(pkgFile, 'utf-8')))

    expect(pkg.name).equal('aria')
    expect(pkg.main).equal('aria.js')
    expect(pkg.module).equal('aria.es.js')
  })

})