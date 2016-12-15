import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'
import babelrc from 'babelrc-rollup'


export default {
  entry: 'src/client/index.js',
  plugins: [
    commonjs(),
    babel(babelrc({
      addExternalHelpersPlugin: false
    })),
    uglify()
  ],
  format: 'iife',
  moduleName: 'telegram',
  dest: 'src/assets/a.js'
}
