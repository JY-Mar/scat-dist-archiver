import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { cwd } from 'process'
import { ExtensionType, type ArchiverExt, type ArchiverOptions, type ArchiverType, type ResolvedArchiveOption, type TargetPath } from './type'

/**
 * Supported file extensions key list
 */
export const ArchiverTypeKeys = Object.keys(ExtensionType) as ArchiverType[]
/**
 * Supported file extensions value list
 */
export const ArchiverTypeValues = Object.values(ExtensionType) as ArchiverExt[]

/**
 * Check valid
 * @en_US validate the value is valid (single value)
 * @param         {T} value
 * @return        {Boolean}
 */
export function validItem<T = any>(value: T): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value === true || value === false
  if (typeof value === 'number') return !isNaN(value)
  if (typeof value === 'string') return value.length > 0
  if (typeof value === 'function') {
    const funStrMatch = value.toString().replace(/\s+/g, '').match(/{.*}/g)
    if (Object.prototype.toString.call(funStrMatch) === '[object Array]' && (funStrMatch as RegExpMatchArray).length > 0) {
      return (funStrMatch as RegExpMatchArray)[0] !== '{}'
    } else {
      return false
    }
  }
  if (typeof value === 'object') {
    if (value instanceof Date) return !isNaN(Date.parse(String(new Date(value))))
    if (Object.prototype.toString.call(value) === '[object Array]') return (value as Array<any>).length > 0
    if (Object.prototype.toString.call(value) === '[object Object]') return Object.keys(value).length > 0
  }
  return true
}

/**
 * Default archive options
 */
export const defaultOption: Pick<ArchiverOptions<'tgz'>, 'sourceDir' | 'type' | 'includeSource' | 'clear' | 'clearAll' | 'recursive'> & { targetPath?: TargetPath<'tgz'> } = {
  type: 'tgz',
  sourceDir: 'dist',
  targetPath: 'dist.tar.gz',
  includeSource: true,
  clear: true,
  clearAll: false,
  recursive: false
}

/**
 * Remove file or all files with the specified extension from the directory path.
 * @param        {string} path - File path or directory path to remove.
 * @param        {ArchiverType} type - The archive type to remove.
 * @param        {boolean} recursive Whether to recursively remove files with the specified extension inside the subdirectories.
 * @return       {*}
 */
export function removeSync(path?: string, type?: ArchiverType, recursive?: boolean): void
/**
 * Remove file or all files with the specified extension from the directory path.
 * @param        {string} path - File path or directory path to remove.
 * @param        {ArchiverType[]} types - The archive types to remove.
 * @param        {boolean} recursive Whether to recursively remove files with the specified extension inside the subdirectories.
 * @return       {*}
 */
export function removeSync(path?: string, types?: ArchiverType[], recursive?: boolean): void
export function removeSync(path: any, types: any = ArchiverTypeKeys, recursive: boolean = false): void {
  if (!path) return

  try {
    fs.accessSync(path, fs.constants.F_OK)
    const pathStat = fs.statSync(path)
    if (pathStat.isDirectory()) {
      let _types = []
      if (typeof types === 'string') {
        _types.push(types)
      } else if (typeof types === 'object' && Object.prototype.toString.call(types) === '[object Array]') {
        _types.push(...types)
      }
      if (!validItem(types)) return
      const files = fs.readdirSync(path)
      for (const file of files) {
        const filePath = path.join(path, file)
        const _stat = fs.statSync(filePath)
        if (_stat.isDirectory() && recursive) {
          // Recursively remove
          removeSync(filePath, types, recursive)
        } else if (_stat.isFile()) {
          const ext = types.find((v: ArchiverType) => {
            const fullextname = ExtensionType[v]
            return file.endsWith(`.${fullextname}`)
          })
          if (ext) {
            removeSync(filePath, types, recursive)
          }
        }
      }
    } else if (pathStat.isFile()) {
      try {
        fs.unlinkSync(path)
      } catch (err) {
        console.info(chalk.hex('#e74856')(`‼️[@scat1995/archiver]: ${path} unlink failed`))
        throw err
      }
    }
  } catch {
    // Directory not exists
    // do nothing
  }
}

/**
 * Checks whether the file extension matches the specified archive type.
 * @param        {string} targetPath
 * @param        {string} type
 * @return       {*}
 */
export function isTypeMatchExt(targetPath: string, type: string): boolean {
  return targetPath && type && ExtensionType?.[type] && new RegExp(`.+\\.${ExtensionType[type]}\$`).test(targetPath)
}

/**
 * Resolve archive options
 * @param        {ArchiverOptions} options
 * @return       {*}
 */
export function resolveOption(options: ArchiverOptions | undefined = defaultOption): ResolvedArchiveOption[] {
  const result: ResolvedArchiveOption[] = []
  const sourceDir = options?.sourceDir ?? options?.sourceName ?? defaultOption.sourceDir
  const _targetPath = options?.targetPath ?? options?.targetName
  const clear = options?.clear ?? defaultOption.clear
  const clearAll = options?.clearAll ?? defaultOption.clearAll
  const recursive = options?.recursive ?? defaultOption.recursive
  let includeSource = options?.includeSource ?? defaultOption.includeSource
  if (typeof includeSource !== 'boolean') {
    const ignoreBase = options?.ignoreBase
    if (typeof ignoreBase === 'boolean') {
      includeSource = ignoreBase !== true
    }
  }

  let targetPaths: TargetPath<ArchiverType>[] = []
  if (typeof _targetPath === 'string' && _targetPath !== '') {
    targetPaths = [_targetPath]
  } else if (typeof _targetPath === 'object' && _targetPath instanceof Array) {
    targetPaths = (_targetPath || []).filter((v) => typeof v === 'string' && v !== '')
    targetPaths.length <= 0 && (targetPaths = [defaultOption.targetPath])
  } else {
    targetPaths = [defaultOption.targetPath]
  }
  let types: ArchiverType[] = []
  if (typeof options?.type === 'string' && ArchiverTypeKeys.indexOf(options.type) > -1) {
    // single type
    types = [options.type]
  } else if (typeof options?.type === 'object' && options.type instanceof Array) {
    // multiple type
    types = (options?.type || []).filter((v) => typeof v === 'string' && ArchiverTypeKeys.indexOf(v) > -1)
    types.length <= 0 && (types = [defaultOption.type])
  } else {
    // set default type when empty
    types = [defaultOption.type]
  }

  const cwdPath = cwd()
  const pkgPath = path.resolve(cwdPath, sourceDir)
  types.forEach((type) => {
    targetPaths.forEach((targetPath) => {
      const extension = ExtensionType[type]

      let basename: string
      if (isTypeMatchExt(targetPath, type)) {
        basename = targetPath.substring(0, targetPath.indexOf(`.${extension}`))
      } else {
        basename = targetPath
      }

      const fullPath = path.resolve(cwdPath, `${basename}.${extension}`)

      const resolvedOption = {
        sourceDir,
        targetPath,
        type,
        includeSource,
        extension,
        cwdPath,
        pkgPath,
        fullPath,
        clear,
        clearAll,
        recursive
      }

      result.push(resolvedOption)
    })
  })

  return result
}
