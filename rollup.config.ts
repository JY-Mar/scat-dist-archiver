import path from 'path'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import strip from '@rollup/plugin-strip'
import alias from '@rollup/plugin-alias'

const config = defineConfig([
  {
    input: path.join('src', 'index.ts'),
    output: [
      // ESModule → ESM
      {
        file: path.join('dist', 'index.esm.js'),
        format: 'esm',
        sourcemap: false
      },
      // CommonJS → CJS
      {
        file: path.join('dist', 'index.cjs.js'),
        format: 'cjs',
        sourcemap: false
      }
    ],
    plugins: [
      alias({ entries: [{ find: /^node:(.+)$/, replacement: '$1' }] }),
      resolve({ preferBuiltins: true }), // 解析 node_modules 中的依赖
      commonjs(), // 支持 CommonJS 模块
      terser(),
      json(),
      // 清除调试代码
      strip({
        debugger: true,
        functions: ['console.!(warn|error)', 'assert.*'],
        sourceMap: true
      }),
      typescript()
    ],
    external: ['fs', 'path', 'os', 'process', 'chalk', 'compressing']
  },
  // 类型声明打包
  {
    input: path.join('src', 'index.ts'),
    output: {
      file: path.join('dist', 'index.d.ts'),
      format: 'esm',
      sourcemap: false
    },
    external: ['path'],
    plugins: [
      // 声明合并
      dts()
    ]
  }
])

export default config
