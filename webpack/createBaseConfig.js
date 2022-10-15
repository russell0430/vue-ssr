'use strict'
const path = require('path');

function createBaseConfig() {
  const Config = require("webpack-chain");
  const { VueLoaderPlugin } = require('vue-loader');
  // const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
  const resolve = (dir) => path.join(__dirname,"..", dir);
  // config
  const isProd = process.env.NODE_ENV === 'production';
  const outDir = "../dist";

  // construct the base config
  const config = new Config();
  config
    .mode(isProd ? 'production' : 'development')
    .context(path.resolve(__dirname, "../"))
    .devtool(isProd ? 'source-map' : "#cheap-module-source-map")
    .output
    .path(path.resolve(__dirname,outDir))
    .filename('[name].[contenthash].js')
    .publicPath('/dist/')
    // 给打包后的非入口js命名,与splitChunksPlugin配合
    .chunkFilename('[name].[contenthash].js')
    .end()
    .resolve
    .extensions.merge(['.js', '.vue', '.json', '.css']).end()
    .alias
    .set('public', resolve("public"))
    .set("@", resolve('src'))
    .end();

  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader("vue-loader").options({
      compilerOptions: {
        preserveWhitespace: false
      }
    })

  config.module
    .rule('js')
    .test(/\.js$/)
    .exclude.add(/node_modules/).end()
    .use('babel-loader')
    .loader('babel-loader');

  config.module
    .rule('file-loader')
    .test(/\.(png|svg|jpg|gif|ico)$/)
    .use("file-loader")
    .loader("file-loader");

  config.module
    .rule('url-loader')
    .test(/\.(woff|eot|ttf)\??.*$/)
    .use('url-loader')
    .loader('url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]');

  config
    .plugin('vue-loader')
    .use(VueLoaderPlugin).end()

  // function createCSSRule(lang, test, loader, options) {
  //   const baseRule = config.module.rule(lang).test(test).sideEffect(true);
  //   const modulesRule = baseRule.oneOf('modules').resourceQuery(/module/);
  //   const normalRule = baseRule.oneOf('normal');
  //   applyLoader(modulesRule, true);
  //   applyLoader(normalRule, false);

  //   function applyLoaders(rule, modules) {
  //     if(isServer){
  //       if(isProd){
  //         rule.use('extract-css-loader').loader(CSSExtractPlugin.loader)
  //       }
  //       else {
  //         rule.use('vue-style-loader').loader('vue-style-loader');
  //       }
  //     }
  //     rule.use('css-loader')
  //     .loader('css-loader')
  //   }
  // }
  return config;
}


// let config = createBaseConfig();
// config = config.toConfig();
// console.log(config);
// debugger;
module.exports = createBaseConfig;