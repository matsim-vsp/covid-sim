const { description } = require('../../package')

module.exports = {

  base: '/docs/',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'COVID-SIM Documentation',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: true,
    docsDir: '',
    editLinkText: '',
    lastUpdated: true,
    nav: [
      {
        text: 'Documentation',
        link: '/documentation/',
      }
    ],
    sidebar: {
      '/documentation/': [
        {
          title: 'Documentation',
          collapsable: false,
          sidebarDepth: 2, // Set the depth of the sidebar
          children: [
            '',
            'run-setup',
            'configuration',
            'website',
            'plots',
            'introduction',
            'quickstart',
            'repositorystructure.md',
            'simulationsetup.md',
            'episimsimulation.md',
            'outputandanalysis.md',
          ]
        }
      ],
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ],
  markdown: {
    extendMarkdown: (md) => {
      md.use(require('markdown-it-footnote'));
    }
  }
}
