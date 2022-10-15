'use strict'

function createServerConfig() {
  const path = require("path");
  const webpack = require('webpack');
  const nodeExternals = require("webpack-node-externals");
  const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
  const WebpackBar = require('webpackbar');
  const createBaseConfig = require('./createBaseConfig');
  const isProd = process.env.NODE_ENV==="production";
  const config = createBaseConfig();
  const resolve = (dir) => path.join(__dirname, '../', dir);
  config
    .plugin('definePlugin').use(webpack.DefinePlugin, [{
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    }]).end()
    .plugin('VueSSRServerPlugin').use(VueSSRServerPlugin, [{
      filename: "manifest/server.json",
    }]);

  config.when(isProd, () => {
    config.plugin('webpackbar').use(WebpackBar);
  });
  config
    .target('node')
    .devtool("#source-map")
    .entry("app").add(resolve("./client/entry-server.js")).end()
    .output.filename('server-bundle.js').libraryTarget("commonjs2")

  config.externals(nodeExternals({ allowlist: /\.css$/ }))
  const rule = config.module.rule('css').test(/\.css$/);
  rule.use('vueStyleLoader').loader("vue-style-loader");
  rule.use('cssLoader').loader('css-loader');
  return config;
}
// let config = createServerConfig();
// config = config.toConfig();
// debugger
module.exports = createServerConfig;