import fs from 'fs'
import path from 'path'
import { cwd } from 'process'

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
 * filename extension enum
 */
export enum ExtnameType {
  zip = 'zip',
  tar = 'tar',
  tgz = 'tar.gz'
}
/**
 * filename extensions
 */
export const ExtnameTypeList = Object.keys(ExtnameType) as (keyof typeof ExtnameType)[]
/**
 * Supported archive types
 */
export type ArchiverType = keyof typeof ExtnameType
/**
 * Archive Options
 */
export interface ArchiverOptions<T extends ArchiverType | ArchiverType[] = ArchiverType | ArchiverType[]> {
  /**
   * Directory to archive
   */
  sourceName?: string
  /**
   * Archive format
   */
  type: T
  /**
   * Output archive file path
   */
  targetName?: TargetName<T> | TargetName<T>[]
  /**
   * By default, the source folder itself is included in the archive (default `false`). If set to `true`, only the contents inside the folder will be archived.
   */
  ignoreBase?: boolean
}
type TargetName<T> = T extends 'zip' | 'tar' ? string | `${string}.${T}` : T extends 'tgz' ? string | `${string}.tar.gz` : never

/**
 * Default archive options
 */
export const defaultOption: Omit<ArchiverOptions<'tgz'>, 'targetName'> & { targetName?: TargetName<'tgz'> } = {
  type: 'tgz',
  sourceName: 'dist',
  targetName: 'dist.tar.gz',
  ignoreBase: false
}

/**
 * Recursively delete the directory and everything inside it.
 * @param        {string} targetPath
 * @return       {*}
 */
export function deleteDir(targetPath: string): void {
  // 1. Checks whether the specified path exists.
  if (!targetPath) return
  if (!fs.existsSync(targetPath)) return
  // 2. Lists all directories and files located within the specified path.
  const files = fs.readdirSync(targetPath)
  files.forEach((file) => {
    // 3. Generates full paths by combining subdirectory and file names under the specified directory.
    const curPath = path.resolve(targetPath, file)
    // 4. Checks whether the specified path is a directory.
    if (fs.statSync(curPath).isDirectory()) {
      // if it is a directory, Recursively delete all files inside.
      deleteDir(curPath)
    } else {
      // if it is a file, Directly delete it.
      fs.unlinkSync(curPath)
    }
  })
  // Delete specified path
  fs.rmdirSync(targetPath)
}

/**
 * Deletes all files with the specified extension from the `targetPath`.
 * @param        {string} targetPath
 * @param        {ArchiverType} type
 * @return       {*}
 */
export function deleteDirFile(targetPath: string, type: ArchiverType = defaultOption.type): void {
  if (!targetPath) return
  const rootPathFiles = fs.readdirSync(targetPath)
  // console.log("获取==根路径下文件", rootPathFiles);
  rootPathFiles.forEach((file) => {
    const currentPath = path.resolve(targetPath, file)
    // 判断是否是目录
    if (!fs.statSync(currentPath).isDirectory()) {
      // 不是目录 说明是文件
      // 获取文件扩展名
      const extname = path.extname(file)
      const _type = (type === 'tgz' ? 'gz' : type) ?? defaultOption.type
      if (extname === `.${_type}`) {
        // 判断是否 是 打包的文件  是 就删除文件
        fs.unlinkSync(currentPath)
      }
    }
    // console.log("根路劲下目录和文件", currentPath);
  })
}

/**
 * Checks whether the file extension matches the specified archive type.
 * @param        {string} targetPath
 * @param        {string} type
 * @return       {*}
 */
export function isTypeMatchExt(targetPath: string, type: string): boolean {
  return targetPath && type && ExtnameType?.[type] && new RegExp(`.+\\.${ExtnameType[type]}\$`).test(targetPath)
}

export interface ResolvedArchiveOption<T extends ArchiverType = ArchiverType> extends Required<Pick<ArchiverOptions<T>, 'sourceName' | 'type' | 'ignoreBase'>> {
  /**
   * Output archive file path
   */
  targetName: string
  /**
   * full file extension
   */
  extname: string
  /**
   * current working directory of the Node.js process
   */
  cwdPath: string
  /**
   * Packaged directory path, default `../dist`
   */
  pkgPath: string
}

/**
 * Resolve archive options
 * @param        {ArchiverOptions} options
 * @return       {*}
 */
export function resolveOption(options: ArchiverOptions | undefined = defaultOption): ResolvedArchiveOption[] {
  const result: ResolvedArchiveOption[] = []
  const sourceName = options?.sourceName ?? defaultOption.sourceName
  let targetNames: TargetName<ArchiverType>[] = []
  if (typeof options?.targetName === 'string' && options.targetName !== '') {
    targetNames = [options.targetName]
  } else if (typeof options?.targetName === 'object' && options.targetName instanceof Array) {
    targetNames = (options?.targetName || []).filter((v) => typeof v === 'string' && v !== '')
    targetNames.length <= 0 && (targetNames = [defaultOption.targetName])
  } else {
    targetNames = [defaultOption.targetName]
  }
  let types: ArchiverType[] = []
  if (typeof options?.type === 'string' && ExtnameTypeList.indexOf(options.type) > -1) {
    // single type
    types = [options.type]
  } else if (typeof options?.type === 'object' && options.type instanceof Array) {
    // multiple type
    types = (options?.type || []).filter((v) => typeof v === 'string' && ExtnameTypeList.indexOf(v) > -1)
    types.length <= 0 && (types = [defaultOption.type])
  } else {
    // set default type when empty
    types = [defaultOption.type]
  }
  const ignoreBase = options?.ignoreBase ?? defaultOption.ignoreBase
  const cwdPath = cwd()
  const pkgPath = path.resolve(cwdPath, sourceName)
  types.forEach((tp) => {
    targetNames.forEach((tn) => {
      result.push({
        sourceName,
        targetName: tn,
        type: tp,
        ignoreBase,
        extname: ExtnameType[tp],
        cwdPath,
        pkgPath
      })
    })
  })

  return result
}
