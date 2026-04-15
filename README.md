# scat-dist-archiver

> A universal plugin for Webpack, Vite, Rollup to archive the bundle directory which supports `.zip` `.tar` `.tgz` formats.

## Module formats

Plugin that supports multiple module formats — `ESModule` and `CommonJS` — and automatically applies the most appropriate import strategy based on the runtime environment.

> Added support for `ESModule` and `CommonJS` environments in version 1.0.3.
> `UMD` is no longer supported in version 2.0.0.
> Webpack plugin is supported in version 2.0.0+.

|     Module formats     | CommonJS | ESModule |
| :--------------------: | :------: | :------: |
| Applicable Environment | Node.js  | Node.js  |

## Installaion

```bash
# 1.0.0 ~ 1.0.6 (Deprecated)
npm install rollup-plugin-compressor --dev
# 2.0.0+
npm install @scat1995/archiver --dev
```

## Usage

Modify configuration file of project. it would archive `dist` directory to `dist.tar.gz` by default. For example:

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
// 1.0.0 ~ 1.0.6 (Deprecated)
import Compressor from 'rollup-plugin-compressor'
// 2.0.0+
import { VitePluginArchiver } from '@scat1995/archiver'

/* ...Your code... */

export default defineConfig({
  /* ...Your code... */
  plugins: [
    // 1.0.0 ~ 1.0.6 (Deprecated)
    Compressor({
      type: 'tgz',
      targetName: 'dist.tar.gz',
      sourceName: 'dist',
      ignoreBase: false
    }),
    // 2.0.0+
    VitePluginArchiver({
      type: 'tgz',
      targetPath: 'dist.tar.gz',
      sourceDir: 'dist',
      includeSource: true
    })
  ]
  /* ...Your code... */
})
```

### Rollup

```ts
// rollup.config.ts
import { defineConfig } from 'rollup'
// 1.0.0 ~ 1.0.6 (Deprecated)
import Compressor from 'rollup-plugin-compressor'
// 2.0.0+
import { RollupPluginArchiver } from '@scat1995/archiver'

/* ...Your code... */

export default defineConfig({
  /* ...Your code... */
  plugins: [
    // 1.0.0 ~ 1.0.6 (Deprecated)
    Compressor({
      type: 'tgz',
      targetName: 'dist.tar.gz',
      sourceName: 'dist',
      ignoreBase: false
    }),
    // 2.0.0+
    RollupPluginArchiver({
      type: 'tgz',
      targetPath: 'dist.tar.gz',
      sourceDir: 'dist',
      includeSource: true
    })
  ]
  /* ...Your code... */
})
```

### Webpack

```js
// vue.config.js / webpack.config.js
// 2.0.0+
const ArchiverWebpackPlugin = require('@scat1995/archiver').ArchiverWebpackPlugin

module.exports = {
  // In plugins
  plugins: [
    new ArchiverWebpackPlugin({
      type: 'tgz',
      targetPath: 'dist.tar.gz',
      sourceDir: 'dist',
      includeSource: true
    })
  ]
  // In chainWebpack
  chainWebpack: (config) => {
    config.plugin('archiver').use(ArchiverWebpackPlugin, [
      {
        sourceDir: path.join('dist', buildFolderPath),
        type: ['tgz', 'zip'],
        targetPath: path.join('dist', buildFolderPath),
        includeSource: true
      }
    ])
  }
}
```

### Options Description

|     Option      |     Default     |                                                                   Description                                                                   |           Optional            |   version   |
| :-------------: | :-------------: | :---------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------: | :---------: |
|     `type`      |     `'tgz'`     |                                                                 Archive format                                                                  | `'zip'` \| `'tar'` \| `'tgz'` |   2.0.0+    |
|  `targetPath`   | `'dist.tar.gz'` |                                                            Output archive file name                                                             |                               |   2.0.0+    |
|  `targetName`   | `'dist.tar.gz'` |                                                             Alias for `targetPath`                                                              |                               | 1.0.0~1.0.6 |
|   `sourceDir`   |    `'dist'`     |                                                              Directory to archive                                                               |                               |   2.0.0+    |
|  `sourceName`   |    `'dist'`     |                                                              Alias for `sourceDir`                                                              |                               | 1.0.0~1.0.6 |
| `includeSource` |     `true`      |                                               If `false`, only archive contents inside the folder                                               |       `true` \| `false`       |   2.0.0+    |
|  `ignoreBase`   |     `false`     |                                               If `true`, only archive contents inside the folder                                                |       `true` \| `false`       | 1.0.0~1.0.6 |
|     `clear`     |     `true`      |                                          If `true`, clear the existing archived file before archiving                                           |       `true` \| `false`       |   2.0.0+    |
|   `clearAll`    |     `false`     |                        If `true`, clear all the existing archived file (`'zip'` \| `'tar'` \| `'tgz'`) before archiving                         |       `true` \| `false`       |   2.0.0+    |
|   `recursive`   |     `false`     | If `true`, recursively clear all the existing archived file (`'zip'` \| `'tar'` \| `'tgz'`) before archiving from subdirectories of `sourceDir` |       `true` \| `false`       |   2.0.0+    |

> **Note**: The extname of `targetPath` will be automatically adjusted to match the `type`.
>
> - Example: `type = 'tgz', targetPath = 'dist.tar.gz'`
>   👇
>   Archived file: `dist.zip.tar.gz`
> - Example: `type = 'tgz', targetPath = 'dist.zip'`
>   👇
>   Archived file: `dist.zip.tar.gz`
> - Example: `type = 'tgz', targetPath = 'dist'`
>   👇
>   Archived file: `dist.tar.gz`

## Advanced Usage

"Multiple" mode enables full permutation of combinations when `type` or `targetPath` is an array of strings. For example:

```js
// vite.config.ts
import { defineConfig } from 'vite'
// 1.0.0 ~ 1.0.6 (Deprecated)
import Compressor from 'rollup-plugin-compressor'
// 2.0.0+
import { VitePluginArchiver } from '@scat1995/archiver'

/* ...Your code... */

const options = {
  sourceName: 'dist',

  // ** [e.g.1] The following code will generate compressed files(packaging 'dist' into zip archive and tar.gz archive):
  // result files: [dist/pkg.zip, dist/pkg.tar.gz]
  type: ['zip', 'tgz'],
  targetName: 'dist/pkg',
  // ** [e.g.1]

  // ** [e.g.2] The following code will generate archived files(packaging 'dist' into zip archive):
  // result files: [dist/pkg1.zip, dist/pkg2.zip]
  type: 'zip',
  targetName: ['dist/pkg1', 'dist/pkg2'],
  // ** [e.g.2]

  // ** [e.g.3] The following code will generate archived files(packaging 'dist' into zip archive and tar.gz archive):
  // result files: [dist/pkg1.zip, dist/pkg1.tar.gz, dist/pkg2.zip, dist/pkg2.tar.gz]
  type: ['zip', 'tgz'],
  targetName: ['dist/pkg1', 'dist/pkg2'],
  // ** [e.g.3]

  ignoreBase: false
}
export default defineConfig({
  /* ...Your code... */
  plugins: [
    // 1.0.0 ~ 1.0.6 (Deprecated)
    Compressor(options),
    // 2.0.0+
    VitePluginArchiver(options)
  ]
  /* ...Your code... */
})
```

## Supported Build Tools

- ✅ Vite
- ✅ Rollup
- ✅ Webpack
