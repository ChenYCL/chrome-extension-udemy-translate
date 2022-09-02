# Chrome 插件模板

## 使用

```
yarn install 
yarn start
yarn build
```

特性：
1. 支持 crx 同 web 开发一样热更新（react-refresh）；
1. 支持 web 和 chrome 插件同时预览，方便开发；
1. 支持 content、background 文件变更自动刷新，无需插件管理手动刷新；
1. 支持 public 目录文件变动自动刷新。。。

## create-react-app 改造步骤

`npm run eject`

### 多入口改造
- 新增 `config/pageConf.js`，开发只需配置这个文件控制入口，内部自动会处理。
```javascript
module.exports = {
  main: { // 必须需要 main 入口
    entry: 'src/pages/index',
    template: 'public/index.html',
    filename: 'index', // 输出为 index.html，默认主入口
  },
  background: {
    entry: 'src/pages/background/index',
  },
  content: {
    entry: 'src/pages/content/index',
  },
  devtools: {
    entry: 'src/pages/devtools/index',
    template: 'public/index.html',
  },
  newtab: {
    entry: 'src/pages/newtab/index',
    template: 'src/pages/newtab/index.html',
  },
  options: {
    entry: 'src/pages/options/index',
    template: 'src/pages/options/index.html',
  },
  panel: {
    entry: 'src/pages/panel/index',
    template: 'public/index.html',
  },
  popup: {
    entry: 'src/pages/popup/index',
    template: 'public/index.html',
  },
};
```
```typescript
type PageConfType = { 
  [key: string]: {
    entry: string; // webpack.entry 会转化为绝对路径
    template?: string; // 表示有 html，没有表示纯 js 不会触发 webapck HMR
    filename?: string; // 输出到 build 中的文件名，默认是 key 的值
  }
}
```

- 修改 `config/paths.js`
```diff
+ /** 改动：多入口配置 */
+ const pages = Object.entries(require('./pageConf'));
+ // production entry
+ const entry = pages.reduce((pre, cur) => {
+   const [name, { entry }] = cur;
+   if(entry) {
+     pre[`${name}`] = resolveModule(resolveApp, entry);
+   }
+   return pre;
+ }, {});
+
+ // HtmlWebpackPlugin 处理 entry
+ const htmlPlugins = pages.reduce((pre, cur) => {
+   const [name, { template, filename }] = cur;
+   template && pre.push({
+     name,
+     filename: filename,
+     template: resolveApp(template),
+   });
+   return pre;
+ }, []);
+ 
+ // 检查必须文件是否存在
+ const requiredFiles = pages.reduce((pre, cur) => {
+   const { entry, template } = cur[1];
+   const entryReal = entry && resolveModule(resolveApp,entry);
+   const templateReal =  template && resolveApp(template);
+   entryReal && !pre.includes(entryReal) && pre.push(entryReal);
+   templateReal && !pre.includes(templateReal) && pre.push(templateReal);
+   return pre;
+ }, []);
```

```diff
// config after eject: we're in ./config/
module.exports = {
  ...
+  entry,
+  requiredFiles,
+  htmlPlugins,
};
```

- 修改 `config/webpack.config.js`
```diff
- entry: paths.appIndexJs,
+ entry: paths.entry,
output: {
-  filename: ...
+  filename: '[name].js',
-  chunkFilename: ...
},

...

plugins: [
  // Generates an `index.html` file with the <script> injected.
-  new HtmlWebpackPlugin(...)
  /** 改动：多页改造 */
+  ...paths.htmlPlugins.map(({ name, template, filename }) => new HtmlWebpackPlugin(
    Object.assign(
      {},
      {
        inject: true,
-        template: paths.appHtml,
+        template: template,
+        filename: `${filename || name}.html`,
+        chunks: [name],
+        cache: false,
      },
      ...
    )
+  )),
  new MiniCssExtractPlugin({
-    filename: 'static/css/[name].[contenthash:8].css',
-    chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
+    /** 改动：CSS 文件名写死，不需要运行时 CSS */
+    filename: '[name].css',
+    runtime: false,
  }),
]
```

### 监听 public 目录
非 html 文件改动，会自动复制输出到 build，对于一些不常改动的静态资源可以放在 public 目录。
- `yarn add copy-webpack-plugin -D`

- 修改 `config/webpack.config.js`
```diff
plugins: [
+  /** 改动：监听 public 文件改动，复制最新到 build */
+  new CopyPlugin({
+    patterns: [
+      {
+        context: paths.appPublic,
+        from: '**/*',
+        to: path.join(__dirname, '../build'),
+        transform: function (content, path) {
+          if(path.includes('manifest.json')) {
+            return Buffer.from(
+              JSON.stringify({
+                // version: process.env.npm_package_version,
+                // description: process.env.npm_package_description,
+                ...JSON.parse(content.toString()),
+              })
+            );
+          }
+          return content;
+        },
+        // filter: (resourcePath) => {
+        //   console.log(resourcePath);
+        //   return !resourcePath.endsWith('.html');
+        // },
+        globOptions: {
+          dot: true,
+          gitignore: true,
+          ignore: ['**/*.html'], // 过滤 html 文件
+        },
+      },
+    ],
+  }),
]
```

- 修改 `scripts/build.js`
```diff
// 删除 copy 代码
- copyPublicFolder()
```

### 手动 webpack HMR

由于 CSP 的限制，例如 content 是无法请求热更新的代码，开发时略过

- 修改 `scripts/start.js` 中 checkBrowsers().then 修改 entry
```diff
const config = configFactory('development');
+ /** 改动：手动 HRM，在 crx 中必须带上 hostname、port 否则无法热更新，坑了很久。。。 */
+ const pages = Object.entries(require('../config/pageConf'));
+ pages.forEach((cur) => {
+   const [name, { template }] = cur;
+   const url = config.entry[name];
+   if(url && template) {
+     // https://webpack.js.org/guides/hot-module-replacement/#via-the-nodejs-api
+     config.entry[name] = [
+       'webpack/hot/dev-server.js',
+       `webpack-dev-server/client/index.js?hot=true&live-reload=true&hostname=${HOST}&port=${port}`,
+       url,
+     ];
+   }
+ });
```

- 修改 `config/webpackDevServer.config.js`

```diff
+ hot: false, 
+ client: false,
- client: ...,
devMiddleware: {
+  // 开发时把文件写入 build 目录，而不是内存中
+  writeToDisk: true,
}
```


- 修改 `config/webpack.config.js`
```diff
- const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

...

plugins: [
  ...
-  isEnvProduction &&
-    shouldInlineRuntimeChunk &&
-    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
]
```

### 监听 crx content
chrome content 被修改不希望每次去插件管理界面点击刷新按钮，
而是利用 `webpack.compiler.hooks` 监听文件变化并生成最新的 content 时,
利用 ` Server-Sent Events` 单向下给 `background` 发消息触发 `chrome.runtime.reload`.

- 修改 `scripts/start.js`
```diff
+ /** 改动：SSE 通知 chrome.runtime.reload */
+ const SSEStream = require('ssestream').default;
+ let sseStream;
const serverConfig = {
  ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
  host: HOST,
  port,
+  setupMiddlewares: (middlewares, _devServer) => {
+    if (!_devServer) {
+      throw new Error('webpack-dev-server is not defined');
+    }
+    /** 改动：/reload path SSE */
+    middlewares.unshift({
+      name: 'handle_content_change',
+      path: '/reload', // 监听路由
+      middleware: (req, res) => {
+        console.log('sse reload');
+        sseStream = new SSEStream(req);
+
+        sseStream.pipe(res);
+        res.on('close', () => {
+          sseStream.unpipe(res);
+        });
+      },
+    });
+
+    return middlewares;
+  }
+};
```

在 `devServer.startCallback` 中新增 hooks

```diff
+ /** 改动：console.log 监听文件变化 */
+ let contentOrBackgroundIsChange = false;
+ compiler.hooks.watchRun.tap('WatchRun', (comp) => {
+   if (comp.modifiedFiles) {
+     const changedFiles = Array.from(comp.modifiedFiles, (file) => `\n  ${file}`).join('');
+     console.log('FILES CHANGED:', changedFiles);
+     if(['src/pages/background/', 'src/pages/content/'].some(p => changedFiles.includes(p))) {
+       contentOrBackgroundIsChange = true;
+     }
+   }
+ });
+ 
+ compiler.hooks.done.tap('contentOrBackgroundChangedDone', () => {
+   if(contentOrBackgroundIsChange) {
+     contentOrBackgroundIsChange = false;
+     console.log('--------- 发起 chrome reload 更新 ---------');
+     sseStream?.writeMessage(
+       {
+         event: 'content_changed_reload',
+         data: {
+           action: 'reload extension and refresh current page'
+         }
+       },
+       'utf-8',
+       (err) => {
+         sseStream?.unpipe();
+         if (err) {
+           console.error(err);
+         }
+       },
+     );
+   }
+ });
+ 
+ compiler.hooks.failed.tap('contentOrBackgroundChangeError', () => {
+   contentOrBackgroundIsChange = false;
+ });
```

- 修改 `src/pages/background/index.ts`
```diff
+ if(process.env.NODE_ENV === 'development') {
+   const eventSource = new EventSource(`http://${process.env.REACT_APP__HOST__}:${process.env.REACT_APP__PORT__}/reload/`);
+   console.log('--- 开始监听更新消息 ---');
+   eventSource.addEventListener('content_changed_reload', async ({ data }) => {
+     const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
+     const tabId = tab.id || 0;
+     console.log(`tabId is ${tabId}`);
+     await chrome.tabs.sendMessage(tabId, { type: 'window.location.reload' });
+     console.log('chrome extension will reload', data);
+     chrome.runtime.reload();
+   });
+ }
```

这里有个问题，`chrome.runtime.reload` 过后，如果 content 有跟当前页通信生效，要求刷新当前页。
所以在 content 中监听 `chrome.runtime.reload` 也同时刷新 Tab 页。

- 修改 `src/pages/content/index.ts`

```diff
+ chrome.runtime.onMessage.addListener((msg: MessageEventType, sender: chrome.runtime.MessageSender, sendResponse: (response: string) => void) => {
+   console.log('[content.js]. Message received', msg);
+   sendResponse('received');
+   if(process.env.NODE_ENV === 'development') {
+     if( msg.type === 'window.location.reload' ) {
+       console.log('current page will reload.');
+       window.location.reload();
+     }
+   }
+ });
```

