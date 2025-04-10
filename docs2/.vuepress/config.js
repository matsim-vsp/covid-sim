import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'
import { markdownExtPlugin } from '@vuepress/plugin-markdown-ext'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { searchPlugin } = require('@vuepress/plugin-search')

export default defineUserConfig({
  lang: 'de-DE',
  title: 'Covid Sim Doku',
  description: 'Dokumentation zum Covid Simulator',
  bundler: viteBundler(),

  theme: defaultTheme({
    navbar: [{ text: 'Dokumentation', link: '/docs2/' }],
    sidebar: {
      '/docs2/': [
        {
          text: 'Dokumentation',
          collapsible: false,
          children: [
            '',
            'run-setup',
            'configuration',
            'website',
            'plots',
            'introduction',
            'quickstart',
            'repositorystructure',
            'simulationsetup',
            'episimsimulation',
            'outputandanalysis',
          ],
        },
      ],
    },
  }),

  plugins: [
    markdownExtPlugin({
      footnote: true,
    }),

    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Suche...',
        },
      },
    }),
  ],
})
