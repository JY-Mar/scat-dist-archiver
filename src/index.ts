import os from 'os'
import fs from 'fs'
import chalk from 'chalk'
import compressing from 'compressing'
import { type UnpluginInstance, type UnpluginOptions, type WebpackPluginInstance, createUnplugin } from 'unplugin'
import { defaultOption, resolveOption, removeSync, validItem } from './utils'
import DistArchiver from './type'

const name = 'Archiver'

function initQueue(options: DistArchiver.InputOptions = defaultOption): DistArchiver.ResolvedOptions[] {
  const queue: DistArchiver.ResolvedOptions[] = []

  if (typeof options === 'object' && options) {
    if (Object.prototype.toString.call(options) === '[object Object]') {
      queue.push(...resolveOption(options as DistArchiver.Options))
    } else if (options instanceof Array) {
      options.forEach((opt) => {
        typeof opt === 'object' && Object.prototype.toString.call(opt) === '[object Object]' && queue.push(...resolveOption(opt as DistArchiver.Options))
      })
    }
  }

  return queue
}

/**
 * Before build hook
 * @param queue
 */
function startHandler(queue?: DistArchiver.ResolvedOptions[]): Promise<void> {
  return new Promise((resolve) => {
    const queueCount = (queue || []).length || 0
    if (queueCount <= 0) {
      resolve()
    } else {
      let handlerCount = 0
      queue.forEach((que) => {
        if (handlerCount <= queueCount - 1) {
          let _clearAll = que?.clearAll === true
          if (_clearAll) {
            removeSync(que?.pkgPath, undefined, que?.recursive)
          } else if (que?.clear === true) {
            removeSync(que?.fullPath)
          }
          if (handlerCount === queueCount - 1) {
            resolve()
          }
        }
        handlerCount++
      })
    }
  })
}

/**
 * End build hook
 * @param queue
 */
function endHandler(queue?: DistArchiver.ResolvedOptions[]): Promise<void> {
  return new Promise((resolve) => {
    const queueCount = (queue || []).length || 0
    if (queueCount <= 0) {
      resolve()
    } else {
      let handlerCount = 0
      queue.forEach((que, queIndex) => {
        if (handlerCount <= queueCount - 1) {
          if (validItem(que.sourceDir) && validItem(que.type) && validItem(que.extension) && validItem(que.pkgPath) && validItem(que.fullPath) && validItem(que.includeSource)) {
            const destStream = fs.createWriteStream(que.fullPath)
            const sourceStream = new compressing[que.type].Stream()

            destStream.on('finish', () => {
              process.stdout.write(os.EOL)
              console.info(chalk.cyan(`✨[@scat1995/archiver#${queIndex + 1}]: ${que.sourceDir} archive completed: `))
              console.info(chalk.hex('#757575')(que.fullPath))
            })
            destStream.on('error', (err) => {
              process.stdout.write(os.EOL)
              console.info(chalk.hex('#e74856')(`‼️[@scat1995/archiver#${queIndex + 1}]: ${que.sourceDir} archive failed`))
              throw err
            })

            sourceStream.addEntry(que.pkgPath, { ignoreBase: que.includeSource !== true })
            sourceStream.pipe(destStream)
          }
          if (handlerCount === queueCount - 1) {
            resolve()
          }
        }
        handlerCount++
      })
    }
  })
}

function unpluginFactory(options: DistArchiver.InputOptions): UnpluginOptions & { execute: DistArchiver.InternalExecute } {
  const queue: DistArchiver.ResolvedOptions[] = initQueue(options)

  return {
    name,
    // @ts-ignore
    execute() {
      startHandler(queue).then(() => {
        setTimeout(() => {
          endHandler(queue)
        }, 737)
      })
    },
    buildStart() {
      startHandler(queue)
    },
    buildEnd() {
      // 判断 Vue CLI 的多编译器模式
      if (process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD) {
        // !!! 跳过 !!! Modern Mode 第一轮 (Legacy Bundle)：生成兼容旧浏览器的 JS 文件
        return
      }

      setTimeout(() => {
        endHandler(queue)
      }, 737)
    }
  }
}

const Archiver = {
  ...createUnplugin(unpluginFactory as any),
  exec: (options) => unpluginFactory(options).execute()
} as Pick<UnpluginInstance<DistArchiver.InputOptions, boolean>, 'rollup' | 'webpack'> & {
  vite: UnpluginInstance<DistArchiver.InputOptions, boolean>['rollup']
  exec: DistArchiver.Exec
}

export default Archiver
export const RollupPluginArchiver = Archiver.rollup
export const VitePluginArchiver = Archiver.vite
export class ArchiverWebpackPlugin {
  private instance: WebpackPluginInstance
  constructor(options?: DistArchiver.InputOptions) {
    this.instance = Archiver.webpack(options)
  }
  apply(compiler: any): void {
    this.instance.apply(compiler)
  }
}
export type ArchiverOptions = DistArchiver.Options
export type ArchiverType = DistArchiver.Type
