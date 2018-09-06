/* eslint-disable no-undef,new-cap */
const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
const config = require('config');
const pkg = require('./package');

const name = pkg.name;

if (config.get('uglify')) {
  plugins.push(new uglifyJsPlugin({
    sourceMap: config.get('sourcemap')
  }));
}

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'StyledElements',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'dist'),
    filename: name + '.js',
    publicPath: config.get('publicPath')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'index.html')
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    open: config.get('open')
  }
};
