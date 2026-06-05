import DistArchiver from './type'

/**
 * Default archive options
 */
export const DEFAULT_OPTIONS: Pick<DistArchiver.Options<'tgz'>, 'sourceDir' | 'format' | 'includeSource' | 'clear' | 'clearAll' | 'recursive'> & { targetPath?: DistArchiver.TargetPath<'tgz'> } = {
  format: 'tgz',
  sourceDir: 'dist',
  targetPath: 'dist.tar.gz',
  includeSource: true,
  clear: true,
  clearAll: false,
  recursive: false
}
