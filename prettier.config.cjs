/*
 * @Author       : JY-Mar mjyjy@outlook.com
 * @Date         : 2026-04-15 18:06:19
 * @LastEditTime : 2026-04-15 18:06:20
 * @LastEditors  : JY-Mar mjyjy@outlook.com
 * @Description  : 文件描述
 */
const config = {
  arrowParens: 'always',
  singleQuote: true,
  eslintIntegration: true,
  endOfLine: 'auto',
  printWidth: 200,
  useTabs: false,
  tabWidth: 2,
  jsxSingleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: true,
  semi: false,
  vueIndentScriptAndStyle: false,
  spaceBeforeFunctionParen: true,
  overrides: [
    {
      files: ['*.html'],
      options: { parser: 'html' }
    }
  ]
}

module.exports = config
