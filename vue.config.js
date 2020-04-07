module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/',
  productionSourceMap: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader',
            },
            {
              loader: 'markdown-loader',
              options: {
                /* your options here */
              },
            },
          ],
        },
        {
          test: /\.csv$/,
          use: [
            {
              loader: 'raw-loader',
            },
          ],
        },
      ],
    },
  },
}
