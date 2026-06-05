import os from 'os'
import fs from 'fs'
import compressing from 'compressing'
import { type WebpackPluginInstance, createUnplugin } from 'unplugin'
import { resolveOption, removeSync, validItem, consoler, colorful } from './utils'
import DistArchiver from './type'
import { DEFAULT_OPTIONS } from './options'

const name = 'Archiver'

function unpluginFactory(options: DistArchiver.InputOptions): DistArchiver.OptionsForCreateUnplugin {
  /**
   * Init archivable directories queue
   * @param options
   * @returns
   */
  function initQueue(options: DistArchiver.InputOptions = DEFAULT_OPTIONS): DistArchiver.ResolvedOptions[] {
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
  async function startHandler(queue?: DistArchiver.ResolvedOptions[], showConsoler: boolean = true): Promise<void> {
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
  async function endHandler(queue?: DistArchiver.ResolvedOptions[], showConsoler: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const queueCount = (queue || []).length || 0
      if (queueCount <= 0) {
        resolve()
        return
      }

      let finishCount = 0
      let taskCount = 0
      const indexLength = queue.length > 9 ? 2 : 1

      queue.forEach((que, queIndex) => {
        if (validItem(que.sourceDir) && validItem(que.format) && validItem(que.extension) && validItem(que.pkgPath) && validItem(que.fullPath) && validItem(que.includeSource)) {
          taskCount++
          const writeStream = fs.createWriteStream(que.fullPath)
          const compressStream = new compressing[que.format].Stream()
          const prefix = `#${String(queIndex + 1).padStart(indexLength, ' ')}: `

          writeStream.on('finish', () => {
            if (showConsoler) {
              consoler.info(`${prefix}"${que.sourceDir}" archive completed: ${os.EOL} 👉 ${colorful(que.fullPath, 'tip')}`)
            }
            finishCount++
            if (finishCount === taskCount) {
              resolve()
            }
          })
          writeStream.on('error', (err) => {
            consoler.error(`${prefix}"${que.sourceDir}" archive failed.`)
            reject(err)
          })

          compressStream.addEntry(que.pkgPath, { ignoreBase: que.includeSource !== true })
          compressStream.pipe(writeStream)
        }
      })

      if (taskCount === 0) {
        resolve()
      }
    })
  }

  const queue: DistArchiver.ResolvedOptions[] = initQueue(options)

  return {
    name,
    async execute(showConsoler: boolean = true) {
      await startHandler(queue, showConsoler)
      await new Promise((resolve) => setTimeout(resolve, 737))
      await endHandler(queue, showConsoler)
      return Promise.resolve()
    },
    async buildStart() {
      try {
        await startHandler(queue)
      } catch (error) {
        console.log(error)
      }
    },
    async writeBundle() {
      // 判断 Vue CLI 的多编译器模式
      if (process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD) {
        // !!! 跳过 !!! Modern Mode 第一轮 (Legacy Bundle)：生成兼容旧浏览器的 JS 文件
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 737))
      const timer = Date.now()
      try {
        await endHandler(queue)
        const cost = Date.now() - timer
        if (cost > 1000) {
          consoler.info(`Archive Time: ${Math.ceil((cost * 100) / 1000) / 100}s`)
        } else {
          consoler.info(`Archive Time: ${cost}ms`)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}

const Instance: DistArchiver.Instance = {
  ...createUnplugin(unpluginFactory as any),
  exec: (options, showConsoler) => unpluginFactory(options).execute(showConsoler)
}
const RollupPluginArchiver = Instance.rollup
const VitePluginArchiver = Instance.vite
class ArchiverWebpackPlugin {
  private instance: WebpackPluginInstance
  constructor(options?: DistArchiver.InputOptions) {
    this.instance = Instance.webpack(options)
  }
  apply(compiler: any): void {
    this.instance.apply(compiler)
  }
}
type ArchiverInputOptions = DistArchiver.InputOptions

export { Instance as default, RollupPluginArchiver, VitePluginArchiver, ArchiverWebpackPlugin, ArchiverInputOptions }
