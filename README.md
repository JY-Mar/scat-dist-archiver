A universal plugin for webpack, vite, rollup to archive the bundle directory which supports `.zip` `.tar` `.tgz` formats.

## Module formats

Plugin that supports multiple module formats — `ESModule` and `CommonJS` — and automatically applies the most appropriate import strategy based on the runtime environment.

> Added support for `ESModule` and `CommonJS` environments in version 1.0.3.
> `UMD` is no longer supported in version 1.0.7.

| Module formats         | CommonJS | ESModule          |
| ---------------------- | -------- | ----------------- |
| Applicable Environment | Node.js  | Browser & Node.js |

## Installaion

```bash
# v1.0.0 ~ v1.0.6 (Deprecated)
npm install rollup-plugin-archiver --dev
# v1.0.7+
npm install @scat1995/archiver --dev
```

## Usage

Modify configuration file of project. it would archive `dist` directory to `dist.tar.gz` by default. For example:

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import Archiver, { ArchiverOptions } from '@scat1995/archiver'

/* ...Your code... */

const archOptions: ArchiverOptions = {
  type: 'tgz',
  targetName: 'dist.tar.gz',
  sourceName: 'dist',
  ignoreBase: false
}
export default defineConfig({
  /* ...Your code... */
  plugins: [Archiver(archOptions)]
  /* ...Your code... */
})
```

### Rollup

```ts
// rollup.config.ts
import { defineConfig } from 'rollup'
import Archiver, { ArchiverOptions } from '@scat1995/archiver'

/* ...Your code... */

const archOptions: ArchiverOptions = {
  type: 'tgz',
  targetName: 'dist.tar.gz',
  sourceName: 'dist',
  ignoreBase: false
}
export default defineConfig({
  /* ...Your code... */
  plugins: [Archiver(archOptions)]
  /* ...Your code... */
})
```

### Webpack

```js
// webpack.config.js
const WebpackArchiverPlugin = require('@scat1995/archiver')

const archOptions = {
  type: 'tgz',
  targetName: 'dist.tar.gz',
  sourceName: 'dist',
  ignoreBase: false
}

module.exports = {
  plugins: [WebpackArchiverPlugin(archOptions)]
}
```

### Options Description

- `type`: Archive format - `'zip' | 'tar' | 'tgz'` (default: `'tgz'`)
- `targetName`: Output archive file name (default: `'dist.tar.gz'`)
- `sourceName`: Directory to archive (default: `'dist'`)
- `ignoreBase`: If `true`, only archive contents inside the folder (default: `false`)

> **Note**: The extname of `targetName` will be automatically adjusted to match the `type`.
>
> - Example: `type = 'tgz', targetName = 'dist.tar.gz'` => result: `dist.tar.gz`
> - Example: `type = 'tgz', targetName = 'dist.zip'` => result: `dist.zip.tar.gz`
> - Example: `type = 'tgz', targetName = 'dist'` => result: `dist.tar.gz`

## Advanced Usage

"Multiple" mode enables full permutation of combinations when `type` or `targetName` is an array of strings. For example:

```js
// vite.config.ts
import { defineConfig } from 'vite'
import Archiver, { ArchiverOptions } from '@scat1995/archiver'

/* ...Your code... */

const archOptions: ArchiverOptions = {
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
  plugins: [Archiver(archOptions)]
  /* ...Your code... */
})
```

## Supported Build Tools

- ✅ Vite
- ✅ Rollup
- ✅ Webpack

## Apologize

This README was translated with the help of Copilot. We apologize for any potential inaccuracies.
