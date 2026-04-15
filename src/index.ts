import os from 'os'
import compressing from 'compressing'
import chalk from 'chalk'
import fs from 'fs'
import { type UnpluginOptions, type WebpackPluginInstance, createUnplugin } from 'unplugin'
import {
  defaultOption,
  resolveOption,
  removeSync,
  validItem,
  type ArchiverOptions,
  type ArchiverType,
  type ResolvedArchiveOption
} from './utils'

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
    let _clearAll = que?.clearAll === true
    if (_clearAll) {
      removeSync(que?.pkgPath, undefined, que?.recursive)
    } else if (que?.clear === true) {
      removeSync(que?.fullPath)
    }
  })
}

/**
 * End build hook
 * @param queue
 */
function endHandler(queue?: ResolvedArchiveOption[]): void {
  queue.forEach((que, queIndex) => {
    if (validItem(que.sourceDir) && validItem(que.type) && validItem(que.extension) && validItem(que.pkgPath) && validItem(que.fullPath) && validItem(que.includeSource)) {
      const destStream = fs.createWriteStream(que.fullPath)
      const sourceStream = new compressing[que.type].Stream()

      destStream.on('finish', () => {
        process.stdout.write(os.EOL)
        console.log(chalk.cyan(`✨[@scat1995/archiver#${queIndex + 1}]: ${que.sourceDir} archive completed: `))
        console.log(chalk.hex('#757575')(que.fullPath))
      })
      destStream.on('error', (err) => {
        process.stdout.write(os.EOL)
        console.log(chalk.hex('#e74856')(`‼️[@scat1995/archiver#${queIndex + 1}]: ${que.sourceDir} archive failed`))
        throw err
      })

      sourceStream.addEntry(que.pkgPath, { ignoreBase: que.includeSource !== true })
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
      compiler.hooks.beforeRun.tap(name, () => {
        startHandler(queue)
      })
      compiler.hooks.done.tap(name, () => {
        // 关键判断：如果是 Vue CLI 的多编译器模式，且当前不是最后一轮构建，则跳过
        // 或者通过 stats 里的信息判断
        if (process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD) {
          // Modern Mode 第一轮 (Legacy Bundle)：生成兼容旧浏览器的 JS 文件
          // 跳过
          return
        }
        // Modern Mode 第二轮 (Module Bundle)：生成体积更小、更快的现代浏览器代码。
        endHandler(queue)
      })
    }
  }
}

const Archiver = createUnplugin(unpluginFactory)

export default Archiver
export const RollupPluginArchiver = Archiver.rollup
export const VitePluginArchiver = Archiver.vite
export class ArchiverWebpackPlugin {
  private instance: WebpackPluginInstance
  constructor(options?: Options) {
    this.instance = Archiver.webpack(options)
  }
  apply(compiler: any): void {
    this.instance.apply(compiler)
  }
}
export type { ArchiverOptions, ArchiverType } from './utils'
