'use strict'
const path = require("path");
function createClientConfig() {
  const isProd = process.env.NODE_ENV === 'production';

  const createBaseConfig = require("./createBaseConfig");

  // plugins
  const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const CompressionPlugin = require("compression-webpack-plugin");
  const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
  const WebpackBar = require('webpackbar')

  const webpack = require("webpack");
  const resolve = (dir) => path.join(__dirname, '../', dir);
  const config = createBaseConfig();

  config.entry('app')
    .add(resolve('./client/entry-client.js'));

  config
    .plugin('definePlugin').use(webpack.DefinePlugin, [{
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"client"'
    }]).end()

    .plugin('VueSSRClientPlugin').use(VueSSRClientPlugin, [{
      filename: "manifest/client.json",
    }]).end()
    .plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [{
      filename: 'style.css'
    }]);
  config.when(isProd,
    () => {
      config
        .plugin('CompressionPlugin').use(CompressionPlugin).end()
        .plugin('HashModuleIdsPlugin').use(webpack.HashedModuleIdsPlugin).end()
        .plugin('webpackBar').use(WebpackBar).end()
    }
  );

  config.optimization.splitChunks({
    cacheGroups: {
      vendor: {
        name: 'chunk-vendors',
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
        chunks: 'initial',
      },
      common: {
        name: 'chunk-common',
        minChunks: 2,
        priority: -20,
        chunks: 'initial',
        reuseExistingChunk: true
      }
    },
  });

  config.optimization.runtimeChunk({
    name: 'manifest'
  });

  config.when(isProd, () => {
    config.optimization.minimizer('CssMinimizerPlugin').use(CssMinimizerPlugin)
  });

  const rule = config.module
    .rule('css')
    .test(/\.css$/);

  rule.use('MiniCssExtractPlugin')
    .loader(MiniCssExtractPlugin.loader)
    .options({ esModule: false });

  rule.use('css-loader')
    .loader('css-loader');
  return config;
}
// 
module.exports = createClientConfig;