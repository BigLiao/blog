
# 搭建 Vue 工程
本文讲解从头搭建一个生产可用的 Vue 工程。主要是基于的官方脚手架 vue-cli 3.0 ，搭建一个通用的目录，并加入自己常用的配置和做一些基本封装。
## 创建
#### 安装 Vue Cli
这是 Vue 官方出的脚手架，类似于 React 的 `create-react-app`。
详细介绍可以去 [官网](https://cli.vuejs.org/zh/guide/) 阅读文档。
通过 npm 全局安装 vue-cli
``` bash
npm install -g @vue/cli
```
安装后可以通过 `vue --version` 命令查看版本。
![4034260f3fdc067c8310738884612da1](搭建 Vue 工程.resources/微信截图_20190307173643.png)

#### 通过 Vue Cli 创建项目
运行 `vue create your-project-name` 来创建一个项目。
##### Please pick a preset
这个时候会提示选择配置，这里选择手动配置所需的功能:
- `Babel`: 把最新的 JavaScript 语法转义成浏览器兼容的语法
- `Router`: 安装 Vue 官方路由库 `vue-router`
- `VueX`: Vue 官方推荐的状态管理库，大型项目所需
- `Css Pre-processors`: 安装 css 预处理器的相关 loader，比如 `less`
- `Linter`: 配置`eslint` 代码规范检查
- `Unit`: 单元测试用的
![c6a8a2ec07a120e459b7e27336ef5848](搭建 Vue 工程.resources/微信截图_20190307174337.png)
##### Use history mode for router?
选择使用 vue-router 里的 hash 模式 还是 history 模式。history 模式需要服务端配合，所以这里先选择 `n` 并回车——使用hash 模式，等生产环境时服务端支持的话再改为 history 模式即可。
##### Pick a CSS pre-processor
选择自己熟悉的 CSS 预处理器，这里我选择 `less`。
##### Pick a linter / formatter config
这里我选择 `ESLint + Prettier` ，后面会自己配置规则。
##### Pick additional lint features
选择什么时候进行语法检查，是保存的时候，还是 `git commit` 的时候。我选 `lint on save` ——保存的时候进行语法检查。
##### Pick a unit testing solution
选择单元测试框架。`Mocha + Chai` 非常好用。
##### Where do you prefer placing config for Babel, PostCSS, ESLint, etc.?
选择在哪里存放配置信息，独立存放还是放在 `package.json` 里面。当然是 `In dedicated config files` 独立存放啦！
##### Save this as a preset for future projects?
可以把上述配置信息保存起来，这样以后创建项目直接选择就可以了。配置信息会保存成一个 `json` 格式放在 `~/.vuerc`文件里。
到这里就会安装依赖，然后就可以使用了。
#### 启动项目
可以看到 `package.json` 里面有启动脚本的配置，运行 `npm run serve` 就可以启动项目。
```
// package.json
{
"scripts": {
"serve": "vue-cli-service serve",
"build": "vue-cli-service build"
}
}
```
把 `serve` 改成 `start`，这样只要 `npm start` 命令就能启动了。与 `create-react-app` 保存一致 :)。
```
// package.json
{
"scripts": {
- "serve": "vue-cli-service serve",
+ "start": "vue-cli-service serve",
"build": "vue-cli-service build"
}
}
```
## 配置
#### webpack 配置
Vue Cli 3.0 版本隐藏了 `webpack` 的配置，内不已经帮我们配置好了，大部分情况下是非常好用的，但我们还是需要定制自己的配置。
在根目录添加文件 `vue.config.js`，里面通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 进行设置。可以参考 Vue Cli 文档里的 [webpack 相关](https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F)。
```
// vue.config.js
module.exports = {
publicPath: PUBLICK_PATH, // 资源打包路径
lintOnSave: true, // 保存的时间进行 lint 检查
};
```
添加路径别名（`alias`）：
```
chainWebpack: config => {
config.resolve.alias
.set("@", resolve("src"))
.set("_c", resolve("src/components"));
},
```
配置开发本地服务器。<br>
`proxy` 里可以设置服务器端地址，可以转发本地请求解决跨域问题。<br>
`host` 改为 `0.0.0.0` 使得局域网内其他电脑可以访问本地开发服务器。<br>
`hot: true` 开启热更新，即不用手动刷新页面。
```
devServer: {
hot: true,
// host: "localhost",
host: '0.0.0.0',
// proxy: 'http://127.0.0.1:7001',
overlay: {
warnings: true,
errors: true
}
},
```
给 css loader 传递配置。<br>
这里给 `less-loader` 添加允许执行 js 的配置。
```
css: {
loaderOptions: {
less: {
javascriptEnabled: true
}
}
}
```
#### ESLint 配置
`eslint` 通过根目录下的 `.eslintrc.js` 进行配置，Vue Cli 默认帮我们做了配置，使用我们安装的时候选择的规则。这里推荐腾讯前端团队的 [ESLint 规则](https://github.com/AlloyTeam/eslint-config-alloy)，用起来非常舒适。
安装 AlloyTeam 的 eslint 扩展：
```
npm install --save-dev eslint-config-alloy
```
配置 `.eslintrc.js`。
规则里的代码缩进是四个空格，我喜欢用两个空格。
```
// .eslintrc.js

module.exports = {
extends: [
'eslint-config-alloy/vue',
],
globals: {
// 这里填入你的项目需要的全局变量
// 这里值为 false 表示这个全局变量不允许被重新赋值，比如：
//
// Vue: false
},
rules: {
// 这里填入你的项目需要的个性化配置，比如：
//
// @fixable 一个缩进必须用两个空格替代
'indent': [
'error',
2,
{
SwitchCase: 1,
flatTernaryExpressions: true
}
],
'no-unused-vars': 'off'
}
};
```
## 目录结构


