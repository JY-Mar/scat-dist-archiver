import path from 'path'
import os from 'os'
import compressing from 'compressing'
import chalk from 'chalk'
import fs from 'fs'
import { type UnpluginOptions, createUnplugin } from 'unplugin'
import { defaultOption, deleteDir, deleteDirFile, isTypeMatchExt, resolveOption, validItem, type ArchiverOptions, type ArchiverType, type ResolvedArchiveOption } from './utils'

function initQueue(options: ArchiverOptions[] | ArchiverOptions<ArchiverType | ArchiverType[]> | undefined = defaultOption): ResolvedArchiveOption[] {
  const queue: ResolvedArchiveOption[] = []

  if (typeof options === 'object' && options) {
    if (Object.prototype.toString.call(options) === '[object Object]') {
      queue.push(...resolveOption(options as ArchiverOptions))
    } else if (options instanceof Array) {
      options.forEach((opt) => {
        typeof opt === 'object' && Object.prototype.toString.call(opt) === '[object Object]' && queue.push(...resolveOption(opt as ArchiverOptions))
      })
    }
  }

  return queue
}

/**
 * Before build hook
 * @param queue
 */
function startHandler(queue?: ResolvedArchiveOption[]): void {
  queue.forEach((que) => {
    if (validItem(que?.pkgPath) && validItem(que?.cwdPath) && validItem(que?.type)) {
      // 1. Deletes packaged directory, default `dist`
      deleteDir(que.pkgPath)
      // 2. Deletes all files with the specified extension from the `cwdPath`.
      deleteDirFile(que.cwdPath, que.type)
    }
  })
}

/**
 * End build hook
 * @param queue
 */
function endHandler(queue?: ResolvedArchiveOption[]): void {
  queue.forEach((que, queIndex) => {
    if (validItem(que.sourceName) && validItem(que.targetName) && validItem(que.type) && validItem(que.extname) && validItem(que.pkgPath) && validItem(que.cwdPath) && validItem(que.ignoreBase)) {
      let basename: string
      if (isTypeMatchExt(que.targetName, que.type)) {
        basename = que.targetName.substring(0, que.targetName.indexOf(`.${que.extname}`))
      } else {
        basename = que.targetName
      }
      const destStream = fs.createWriteStream(path.resolve(que.cwdPath, `${basename}.${que.extname}`))
      const sourceStream = new compressing[que.type].Stream()

      destStream.on('finish', () => {
        process.stdout.write(os.EOL)
        console.log(chalk.cyan(`✨[@scat1995/archiver#${queIndex + 1}]: ${que.sourceName} archive completed: `))
        console.log(chalk.hex('#757575')(path.resolve(que.cwdPath, `${basename}.${que.extname}`)))
      })
      destStream.on('error', (err) => {
        process.stdout.write(os.EOL)
        console.log(chalk.hex('#e74856')(`‼️[@scat1995/archiver#${queIndex + 1}]: ${que.sourceName} archive failed`))
        throw err
      })

      sourceStream.addEntry(que.pkgPath, { ignoreBase: que.ignoreBase })
      sourceStream.pipe(destStream)
    }
  })
}

const name: string = 'Archiver'

type Options = ArchiverOptions[] | ArchiverOptions<ArchiverType | ArchiverType[]> | undefined

function unpluginFactory(options: Options): UnpluginOptions {
  const queue: ResolvedArchiveOption[] = initQueue(options)

  return {
    name,
    rollup: {
      buildStart() {
        startHandler(queue)
      },
      closeBundle() {
        endHandler(queue)
      }
    },
    vite: {
      buildStart() {
        startHandler(queue)
      },
      closeBundle() {
        endHandler(queue)
      }
    },
    webpack: (compiler) => {
      compiler.hooks.compilation.tap(name, () => {
        startHandler(queue)
      })
      compiler.hooks.done.tap(name, () => {
        endHandler(queue)
      })
    }
  }
}

const Archiver = createUnplugin(unpluginFactory)

export default Archiver
export const RollupPluginArchiver = Archiver.rollup
export const VitePluginArchiver = Archiver.vite
export const ArchiverWebpackPlugin = Archiver.webpack
export type { ArchiverOptions, ArchiverType } from './utils'
