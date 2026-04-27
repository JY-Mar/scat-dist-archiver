import os from 'os'
import fs from 'fs'
import compressing from 'compressing'
import { type WebpackPluginInstance, createUnplugin } from 'unplugin'
import { defaultOption, resolveOption, removeSync, validItem, consoler, colorful } from './utils'
import DistArchiver from './type'

const name = 'Archiver'

function unpluginFactory(options: DistArchiver.InputOptions): DistArchiver.OptionsForCreateUnplugin {
  /**
   * Init archivable directories queue
   * @param options
   * @returns
   */
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
  async function startHandler(queue?: DistArchiver.ResolvedOptions[]): Promise<void> {
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
  async function endHandler(queue?: DistArchiver.ResolvedOptions[]): Promise<void> {
    return new Promise((resolve) => {
      const queueCount = (queue || []).length || 0
      if (queueCount <= 0) {
        resolve()
      } else {
        let handlerCount = 0
        const indexLength = queue.length > 9 ? 2 : 1
        queue.forEach((que, queIndex) => {
          if (handlerCount <= queueCount - 1) {
            if (validItem(que.sourceDir) && validItem(que.type) && validItem(que.extension) && validItem(que.pkgPath) && validItem(que.fullPath) && validItem(que.includeSource)) {
              const destStream = fs.createWriteStream(que.fullPath)
              const sourceStream = new compressing[que.type].Stream()
              const prefix = `#${String(queIndex + 1).padStart(indexLength, ' ')}: `
              destStream.on('finish', () => {
                // process.stdout.write(os.EOL)
                consoler.info(`${prefix}"${que.sourceDir}" archive completed: ${os.EOL} 👉 ${colorful(que.fullPath, 'tip')}`)
              })
              destStream.on('error', (err) => {
                // process.stdout.write(os.EOL)
                consoler.error(`${prefix}"${que.sourceDir}" archive failed.`)
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

  const queue: DistArchiver.ResolvedOptions[] = initQueue(options)

  return {
    name,
    // @ts-ignore
    execute() {
      startHandler(queue).then(async () => {
        await new Promise((resolve) => setTimeout(resolve, 737))
        endHandler(queue)
      })
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
  exec: (options) => unpluginFactory(options).execute()
}

export default Instance
export const RollupPluginArchiver = Instance.rollup
export const VitePluginArchiver = Instance.vite
export class ArchiverWebpackPlugin {
  private instance: WebpackPluginInstance
  constructor(options?: DistArchiver.InputOptions) {
    this.instance = Instance.webpack(options)
  }
  apply(compiler: any): void {
    this.instance.apply(compiler)
  }
}
export type ArchiverInputOptions = DistArchiver.InputOptions
