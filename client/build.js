// todo: apply it like vuepress do, maybe long long later :)

// vuepress custom vue-server-renderer/client-plugin
// which is little complex for now
const webpack = require("webpack");
const { createBundleRenderer } = require("vue-server-renderer");
const createClientConfig = require("../webpack/createClientConfig");
const createServerConfig = require("../webpack/createServerConfig");

/**
 * relate to : https://github1s.com/vuejs/vuepress/blob/v1.9.7/packages/@vuepress/core/lib/node/build/index.js
 * 
 * 
 * @param {outDir:string,ssrTemplate:string} ctx
 * @returns {BundleRenderer}
 */
async function buildRenderder(ctx) {
  const serverConfig = createServerConfig().toConfig();
  const clientConfig = createClientConfig().toConfig();
  const stats = await compile([clientConfig, serverConfig]);
  const serverBundle = require(path.resolve(ctx.outDir, 'manifest/server.json'));
  const clientManifest = require(path.resolve(ctx.outDir, 'manifest/client.json'));

  await fs.remove(path.resolve(ctx.outDir), 'manifest');
  const renderer = createBundleRenderer(serverBundle, {
    clientManifest,
    runInNewContext: false,
    inject: false,
    shouldPrefetch: () => true,
    template: await fs.readFile(ctx.ssrTemplate, 'utf-8')
  })
  return renderer
}
/**
 * webpack and return result in JSON
 * @param {Object||Object[]} config 
 * @returns {Promise<Object>}
 */
function compile(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        stats.toJson().errors.forEach((err) => {
          console.log(err);
        })
        reject(new Error(`Failed to compile with errors`));
        return;
      }
      if (env.isDebug && stats.hasWarnings()) {
        stats.toJson().warnings.forEach(warning => {
          console.log(warning);
        })
      }
      resolve(stats.toJson({
        modules: false
      }))
    })
  })
}
