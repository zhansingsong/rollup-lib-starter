import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import filesize from 'rollup-plugin-filesize';
import {uglify} from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const {BUILD} = process.env;

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js', // 使用 typescript，执行更改一下后缀即可：index.ts
    output: [
      {
        name: pkg.name,
        file: pkg.browser,
        format: 'umd',
      },
      {file: pkg.main, format: 'cjs'},
      {file: pkg.module, format: 'es'},
    ],
    plugins: [
      postcss({
        preprocessor: (content) =>
          new Promise((resolve, reject) => {
            const result = sass.renderSync({file: content});
            console.log(result);
            resolve({code: result.css.toString()});
          }),
        plugins: [autoprefixer],
        modules: {
          generateScopedName: `${pkg.name}_[local]_[hash:base64:6]`,
        },
        minimize: {
          reduceIdents: false,
        },
        extensions: ['.scss', '.css'],
        sourceMap: BUILD ? false : 'inline',
      }),
      resolve({extensions}), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        externalHelpers: false,
        exclude: './node_modules/**',
        extensions,
      }),
      BUILD ? [...[uglify(), filesize()]] : null,
      serve({
        host: '127.0.0.1',
        port: 3333,
        contentBase: '',
      }),
    ],
  },
];
