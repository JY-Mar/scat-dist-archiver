# @scat1995/archiver

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

![NPM](https://nodei.co/npm/@scat1995/archiver.png)

```bash
# 1.0.0 ~ 1.0.6 (Deprecated)
npm install rollup-plugin-compressor --dev
# 2.0.0+
npm install @scat1995/archiver --dev
```

## Usage

Modify configuration file of project. it would archive `dist` directory to `dist.tar.gz` by default. For example:

### Vite

#### For 1.0.0 ~ 1.0.6 (Deprecated)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import Compressor from 'rollup-plugin-compressor'
/* ...Your code... */
export default defineConfig({
  /* ...Your code... */
  plugins: [
    Compressor({ ... })
  ]
  /* ...Your code... */
})
```

#### For 2.0.0+

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { VitePluginArchiver } from '@scat1995/archiver'
/* ...Your code... */
export default defineConfig({
  /* ...Your code... */
  plugins: [
    VitePluginArchiver({ ... })
  ]
  /* ...Your code... */
})
```

### Rollup

#### For 1.0.0 ~ 1.0.6 (Deprecated)

```ts
// rollup.config.ts
import { defineConfig } from 'rollup'
import Compressor from 'rollup-plugin-compressor'
/* ...Your code... */
export default defineConfig({
  /* ...Your code... */
  plugins: [
    Compressor({ ... })
  ]
  /* ...Your code... */
})
```

#### For 2.0.0+

```ts
// rollup.config.ts
import { defineConfig } from 'rollup'
import { RollupPluginArchiver } from '@scat1995/archiver'
/* ...Your code... */
export default defineConfig({
  /* ...Your code... */
  plugins: [
    RollupPluginArchiver({ ... })
  ]
  /* ...Your code... */
})
```

### Webpack

#### For 2.0.0+

```js
// vue.config.js / webpack.config.js
const { ArchiverWebpackPlugin } = require('@scat1995/archiver')
/* ...Your code... */
module.exports = {
  /* ...Your code... */
  // 1. Plugins
  plugins: [
    new ArchiverWebpackPlugin({ ... })
  ]
  /* ...Your code... */
  // 2. ChainWebpack
  chainWebpack: (config) => {
    config.plugin('archiver').use(ArchiverWebpackPlugin, [{ ... }])
  }
  /* ...Your code... */
}
```

### NodeJS

#### For 2.0.3+

Supports external archiving operations.

```ts
import Archiver from '@scat1995/archiver'

Archiver.exec({ ... })
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

When `type` or `targetPath` is a string array, all possible combinations will be enumerated and these archive files will be generated. An example is as follows:

```js
// vite.config.ts
import { defineConfig } from 'vite'
// For 1.0.0 ~ 1.0.6 (Deprecated)
import Archiver from 'rollup-plugin-compressor'
// For 2.0.0+
import { VitePluginArchiver as Archiver } from '@scat1995/archiver'
/* ...Your code... */
export default defineConfig({
  /* ...Your code... */
  plugins: [
    Archiver({
      sourceName: 'dist',
      type: ['zip', 'tgz'],
      targetName: ['dist/pkg1', 'dist/pkg2'],
      ignoreBase: false
    })
  ]
  /* ...Your code... */
})
```

After running the above code, the following files will be generated:

- `dist/pkg1.zip`
- `dist/pkg1.tar.gz`
- `dist/pkg2.zip`
- `dist/pkg2.tar.gz`

## Supported Build Tools

- ✅ Vite
- ✅ Rollup
- ✅ Webpack
