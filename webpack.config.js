const webpack = require('webpack');
const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = function(env) {
  const isEnvProduction = !!env && env.production;
  console.log('Production: ', isEnvProduction);

  return {
  devtool: 'cheap-module-eval-source-map',
  entry: './src/index.jsx',
  devtool: 'source-map',//eval | source-map
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.(scss|less|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'ion-conference.[hash].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(
      Object.assign(
         {},
         {
           inject: true,
           template: path.resolve(__dirname, "public/index.html"),
         },
         isEnvProduction
           ? {
               minify: {
                 removeComments: true,
                 collapseWhitespace: true,
                 removeRedundantAttributes: true,
                 useShortDoctype: true,
                 removeEmptyAttributes: true,
                 removeStyleLinkTypeAttributes: true,
                 keepClosingSlash: true,
                 minifyJS: true,
                 minifyCSS: true,
                 minifyURLs: true,
               },
             }
           : undefined
    )),
  ],
  devServer: {
    hot: true,
    host: '0.0.0.0',
  }
}};
