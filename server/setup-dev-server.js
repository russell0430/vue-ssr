const webpack = require('webpack');
const path = require("path");
const fs = require("fs");
const chokiar = require("chokidar");
const clientConfig = require("../webpack/webpack.client");
const serverConfig = require("../webpack/webpack.server");
const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
  } catch (e) { }
}
module.exports = function setupDevServer(app, templatePath, callback) {
  let bundle, template, clientManifest, ready;
  const readyPromise = new Promise(resolve => {
    ready = resolve;
  });
  const update = () => {
    if (bundle && clientManifest) {
      ready();
      callback(bundle, {
        template,
        clientManifest
      });
    }
  }
  template = fs.readFileSync(templatePath, 'utf-8');
  chokidar.watch(templatePath).on("change", () => {
    template = fs.readFileSync(templatePath, 'utf-8');
    console.log("index.html template updated.");
    update();
  })
  // modify client config to work with hot middleware
  // todo: do it with webpack-chain
  clientConfig.mode = 'development'
  clientConfig.entry.app = [
    'webpack-hot-middleware/client',
    clientConfig.entry.app
  ]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  );


  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true,
  });

  app.use(devMiddleware);
  clientCompiler.plugin('done', stat => {
    stats = stats.toJson();
    stats.errors.forEach(err => console.error(err));
    stats.warnings.forEach(err => console.warn(err));
    if (stats.errors.length) return;
    clientManifest = JSON.parse(
      readFile(devMiddleware.fileSystem, 'vue-ssr-client-manifest.json')
    );
    update();
  })

  app.use(webpackHotMiddleware(clientCompiler, {
    heartbeat: 5000,
  }));

  const serverCompiler = webpack(serverConfig);
  const mfs = new MFS();
  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err;
    stats = stats.toJson();
    //
    console.log(stats.errors);
    if (stats.errors.length) return;
    bundle=JSON.parse(readFile(mfs,'vue-ssr-server-bundle.js'));
    update();
  })
  return readyPromise;
}
