import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue2'
import markdownPlugin from 'unplugin-vue-markdown/vite'

export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    build: { sourcemap: true },
    plugins: [
      // vue
      vue({ include: [/\.vue$/, /\.md$/] }),
      // markdown
      markdownPlugin({}),
    ],
    assetsInclude: ['**/*.so'],
    test: {
      globals: true,
      environment: 'jsdom',
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // quietDeps: true,
          // logger: {
          //   warn: () => {},
          // },
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
        '~': '/node_modules',
        path: 'path-browserify',
      },
    },
    define:
      mode === 'test'
        ? {
            'process.env': [],
          }
        : {
            'process.platform': null,
            'process.env': [],
          },
  }
})
