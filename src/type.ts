namespace DistArchiver {
  /**
   * Supported file extensions enum
   */
  export enum Extensions {
    zip = 'zip',
    tar = 'tar',
    tgz = 'tar.gz'
  }
  /**
   * Supported archive types
   */
  export type Type = keyof typeof Extensions
  /**
   * Supported archive extensions
   */
  export type Ext = `${Extensions}`
  /**
   * Output archive file path
   */
  export type TargetPath<T> = T extends 'zip' | 'tar' ? string | `${string}.${T}` : T extends 'tgz' ? string | `${string}.tar.gz` : never
  /**
   * Archiver Options
   */
  export interface Options<T extends Type | Type[] = Type | Type[]> {
    /**
     * 要归档的目录。
     * ***此配置项优先级低于 `sourceDir`。***
     *
     * Directory to archive
     * ***This configuration has a lower priority than `sourceDir`.***
     * @default 'dist'
     * @deprecated Use `sourceDir` instead.
     */
    sourceName?: string
    /**
     * 要归档的目录。
     *
     * Directory to archive.
     * @default 'dist'
     */
    sourceDir?: string
    /**
     * 归档文件格式。
     *
     * Archived file format.
     * @default 'tgz'
     */
    type: T
    /**
     * 输出归档文件路径。
     * ***此配置项优先级低于 `targetPath`。***
     *
     * Output archive file path.
     * ***This configuration has a lower priority than `targetPath`.***
     * @default 'dist.tar.gz'
     * @deprecated Use `targetPath` instead.
     */
    targetName?: TargetPath<T> | TargetPath<T>[]
    /**
     * 输出归档文件路径
     *
     * Output archive file path
     * @default 'dist.tar.gz'
     */
    targetPath?: TargetPath<T> | TargetPath<T>[]
    /**
     * 压缩时，是否忽略最外层的 `sourceDir` 本身，只打包其内部的文件与子目录。
     * ***此配置项优先级低于 `includeSource`。***
     *
     * When compressing, whether to ignore the outermost `sourceDir` itself and only package the files and subdirectories inside it.
     * ***This option is the inverse of `includeSource`.***
     * @description Corresponds to the `ignoreBase` parameter of the `addEntry` method in `compressing.(zip|tar|tgz).Stream`.
     * @default false
     * @deprecated Use `includeSource` instead.
     */
    ignoreBase?: boolean
    /**
     * 压缩时，是否打包`sourceDir`及其内部的文件与子目录。
     * ***此配置项与 `ignoreBase` 相反。***
     *
     * When compressing, whether to pack `sourceDir` along with all its internal files and subdirectories.
     * ***This option is the inverse of `ignoreBase`.***
     * @description Corresponds to the `ignoreBase` parameter of the `addEntry` method in `compressing.(zip|tar|tgz).Stream`.
     * @default true
     */
    includeSource?: boolean
    /**
     * 是否在归档前，删除已存在的与 `type` 、 `targetPath` 对应的归档文件。
     *
     * Whether to delete existing archived files that match the specified `type` and `targetPath` before archiving.
     * @default true
     */
    clear?: boolean
    /**
     * 是否在归档前，删除同目录下所有已存在的此插件支持的归档文件。
     * ***设置为 `true` 时将会覆盖 `clear` 的值***
     *
     * Whether to delete all existing archived files supported by this plugin in the same directory before archiving.
     * ***Overrides the `clear` value when set to true.***
     * @default false
     */
    clearAll?: boolean
    /**
     * `clearAll` 设置为 `true` 时，是否递归删除子目录下的所有已存在的此插件支持的归档文件。
     *
     * When `clearAll` is set to `true`, whether to recursively delete all existing archive files supported by this plugin in subdirectories.
     * @default false
     */
    recursive?: boolean
  }

  /**
   * Input Archiver Options
   */
  export type InputOptions = Options[] | Options<Type | Type[]> | undefined

  /**
   * Resolved Archiver Option
   */
  export interface ResolvedOptions<T extends Type = Type> extends Required<Pick<Options<T>, 'sourceDir' | 'type' | 'includeSource' | 'clear' | 'clearAll' | 'recursive'>> {
    /**
     * Output archive file path
     */
    targetPath: string
    /**
     * full file extension
     */
    extension: string
    /**
     * current working directory of the Node.js process
     */
    cwdPath: string
    /**
     * Packaged directory path, default `../dist`
     */
    pkgPath: string
    /**
     * Full path of the archived file
     */
    fullPath: string
  }

  /**
   * Internal Executable Function
   */
  export interface InternalExecute {
    (): void
  }

  /**
   * External Executable Function
   */
  export interface Exec {
    (Options: InputOptions): any
  }

  /**
   * Console
   */
  export namespace Consoler {
    /**
     * Console output type
     */
    export type MsgType = 'success' | 'warning' | 'error' | 'link' | 'info' | 'tip' | 'emphasize' | (string & Record<never, never>)
  }
}

export default DistArchiver
