// 实际使用的服务器
// 运行在node环境中
// 不参与打包过程,使用打包的结果文件
const fs = require("fs");
const path = require("path");
const express = require("express");
// 缓存机制
const LRU = require('lru-cache');
const { createBundleRenderer } = require("vue-server-renderer");
const resolve = file => path.resolve(__dirname, file);
const setApi = require("./api");
// gzip压缩
const compression = require('compression');
const app = express();
app.use(compression());
const microCache = new LRU({
  max: 100,
  maxAge: 60 * 60 * 1000 * 1 // one hour
});
const serve = (path) => {
  return express.static(resolve(path), {
    maxAge: 60 * 60 * 1000 * 3 //3three hours
  })
}
// 将dist下所有文件都映射
app.use('/dist', serve('../dist', true));
function createRenderer(bundle, options) {
  return createBundleRenderer(
    bundle,
    Object.assign(options, {
      basedir: resolve('../dist'),
      // 不为每一个实例创建完全隔离的环境
      // 因为太耗费资源
      runInNewContext: false,
    })
  )
}

function render(req, res) {
  const hit = microCache.get(req.url);
  if (hit) {
    console.log('response from cache');
    return res.end(hit);
  }
  res.setHeader('Content-Type', 'text/html');
  const handleError = (err) => {
    if (err.url) {
      res.redirect(err.url);
    } else if (err.code === 404) {
      res.status(404).send('404 | page not found');
    } else {
      res.status(500).send('500 |Internal server error~');
      console.log(err);
    }
  }

  const context = {
    title: 'SSR TEST',
    url: req.url,
  };
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err);
    }
    microCache.set(req.url, html);
    res.send(html);
  })
}
const templatePath = resolve('../public/index.template.html');
const template = fs.readFileSync(templatePath, 'utf-8');
const bundle = require("../dist/manifest/server.json");
const clientManifest = require("../dist/manifest/client.json");
// const bundle = require('../dist/vue-ssr-server-bundle.json')
// const clientManifest = require('../dist/vue-ssr-client-manifest.json') // 将js文件注入到页面中
const renderer = createRenderer(bundle, {
  template, clientManifest,
});
const port = 8080;
setApi(app);
app.get('*', render);
app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
})

// 在production模式下
// 实际多了
// 1. LRU-Cache,加速服务器渲染部分常用页面的获取
// 2. express 插件 compression,压缩传输的代码
// 3. clientManifest,告知服务器client的操作?