module.exports = {
  publicPath: process.env.NODE_ENV === '/',
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
          test: /\.(csv|vert|frag)$/,
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
