---
Title: webpack揭秘(1)——初探
Author: bigliao
Date: 2019-08-02
---
# webpack揭秘(1)——初探

> 放心，其实我也记不住webpack的配置:)

## webpack简介

![webpack banner](https://cdn.bigliao.com/e792e85d0a8353d919ee7416af469716.png)

这张来自 webpack [官网](https://webpack.js.org/)的配图已经形象地告诉我们 webpack 是做什么用的：把一堆相互依赖的模块（各种类型的文件）打包成静态资源文件。

如果说现在是前端的工业时代，那 Node.js 就是蒸汽机。有了蒸汽机才有各种自动化设备，webpack 就是自动化工厂。在 webpack 之前还有 gulp、grunt，这两者就类似于流水生产线，跟 webpack 的区别在于，这两者是用*任务流*的的方式进行处理，而在 webpack 中一切都是资源。webpack 的强大之处在于能够自动处理资源之间的依赖关系。

现在前端框架（如 React 和 Vue）都会使用 webpack 作为脚手架工具，将 `jsx` 或 `vue` 文件编译成最终的 `js` 和 `css` 文件。这些框架通常帮我们写好了 webpack 的配置，让我们不用关注打包过程而专注业务。本系列文章就是揭秘这些被隐藏的细节。

## webpack的使用

### 安装 webpack

先建立一个 demo 项目，然后安装 webpack。

```sh
# 新建 demo 文件夹
mkdir demo && cd demo

# 初始化 npm
npm init -y

# 安装 webpack
npm install --save-dev webpack webpack-cli
```

安装成功后可以用 `npx webpack --version` 查看版本。当前版本是 4.39.2。

### 准备代码

在 `src` 目录下写源代码

```sh
mkdir src && touch src/main.js && touch src/index.html
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>webpack demo</title>
</head>
<body>
    <h1>webpack 揭秘（1）</h1>
    <button type="button" onclick="handlerClick()">点击</button>
<script src="main.js"></script>
</body>
</html>
```

```js
// src/main.js

function handlerClick() {
    console.log('button clicked!');
}
```

使用在浏览器中打开这个 `index.html` ，点击按钮可以看到控制台打印出内容。

![截图](https://cdn.bigliao.com/12fdfda34410e776d8065ac6933a3009.png)

### 使用 webpack

这个时候在写另外一个 `say.js` 文件，如果我们想要调用里面的函数。

```js
// src/say.js

function say(words) {
    alert('says ' + words);
}

//--------------
// src/main.js

function handlerClick() {
    console.log('button clicked!');
    say('Hello, Webpack!');
}
```

传统的做法是在 `index.html` 里再加一个 `script` 引入 `say.js`。使用 webpack 呢？只需要在 `say.js` 里使用 `export` 和在 `main.js` 里使用 `import` 语句。

```js
// src/say.js

function say(words) {
    alert('says ' + words);
}
export { say };

//--------------
// src/main.js
import { say } from './say';

function handlerClick() {
    console.log('button clicked!');
    say('Hello, Webpack!');
}
```

这个时候刷新页面会看到报错：

![截图](https://cdn.bigliao.com/f92fbe116c71a1424b32897911d00ece.png)

因为我们还没有用 webpack！在 demo 根目录新建文件 `webpack.config.js`：

```js
// webpack.config.js
const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundler.js'
    }
}
```

在 `package.json` 中的 `scripts` 中添加 `"build": "webpack"`，然后执行 `npm run build`。可以看到生成了一个 `dist/bundler.js` 的文件，这个就是我们最终要使用的文件。

![](https://cdn.bigliao.com/81724efb3064ca082e719dde0600e7b1.png)

修改 `index.html`，改成引用 `bundler.js` 文件。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>webpack demo</title>
</head>
<body>
    <h1>webpack 揭秘（1）</h1>
    <button type="button" onclick="handlerClick()">点击</button>
<script src="../dist/bundler.js"></script>
</body>
</html>
```

点击按钮发现还是报错了，WTF！原来是 webpack 打包的时候，各个文件都有独立的作用域，并没有把 `handlerClick`  添加到全局作用域，所以才找不到这个变量。只能改造一下 `main.js` 代码，使用 `addEventListener` 来绑定事件了。记得在 `index.html` 中给按钮添加 `id="btn"`。

```js
// src/main.js
import { say } from './say';

const button = document.getElementById('btn');
button.addEventListener('click', handlerClick);

function handlerClick() {
    console.log('button clicked!');
    say('Hello, Webpack!');
}
```

再执行 `npm run build` 打包一次，这个时候点击按钮就可以看到弹窗了。

### 正式使用 webpack

前面只是为了跟原始写法作对比，接下来开始正式使用。

#### 自动注入 HTML

前面我们要自己在 `index.html` 中引入生成的 `bundler.js` 文件，但真实情况下我们有很多`js` 、`css` 文件要引入，而且文件名也会动态变化，不可能手动引入的，这个时候就要使用 `html-webpack-plugin`。

```sh
# 安装 plugin
npm install --save-dev html-webpack-plugin
```

配置 `webpack.config.js`：

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundler.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}
```

然后删除`src/indx.html` 中的 `script` 标签。执行 `npm run build`，会发现 `dist` 目录下多了一个 `index.html` 文件。这个就是 `html-webpack-plugin` 生产的，它*自动注入* 了打包后的 js 文件。

#### 打包 CSS

webpack 打包各种资源都需要相应的 `loader` 。打包 `css` 的话需要 `css-loader` 和  `style-loader` ，前者让 webpack 可以处理 `css` 文件，后者将 `css` 注入到 `html` 中。

```sh
npm install --save-dev style-loader css-loader
```

配置 `webpack.config.js`：

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundler.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}
```

在 `src` 目录下新增 `style.css` 文件：

```css
/* src/style.css */

.body {
    background-color: #666;
    padding: 20px 30px;
}

h1 {
    font-size: 24px;
}

#btn {
    color: red;
}
```

然后在 `src/main.js` 中引入 `style.css`：

```js
// src/main.js
import { say } from './say';
import './style.css';

const button = document.getElementById('btn');
button.addEventListener('click', handlerClick);

function handlerClick() {
    console.log('button clicked!');
    say('Hello, Webpack!');
}
```

运行打包命令 `npm run build`，然后在浏览器中打开 `dist/index.html` 就可以看到效果了。

![网页截图](https://cdn.bigliao.com/e31a00af6b6a0026cbae3db9f239b1eb.png)

#### 自动打包

每次修改文件后都要打包一次实在是麻烦，可以自动打包吗？当然可以。

在 `package.json` 文件中的 `script` 里新增一个 `webpack --watch` 的命令：

```json
// package.json
{
  // ...
  "scripts": {
    "build": "webpack",
    "dev": "webpack --watch"
  }
  //...
}
```

执行 `npm run dev`，会启用监听模式，webpack 监听到文件修改后会自动打包。比如我们修改一下 `src/style.css` ：

```css
/* src/style.css */

body {
    background-color: #996;
    padding: 20px 30px;
}

h1 {
    font-size: 24px;
}

#btn {
    color: red;
}
```

会看到命令行子自动打包了一次，然后刷新一下浏览器

![网页截图](https://cdn.bigliao.com/350908314fb634dfda23e8b432e0af94.png)

#### 自动刷新浏览器

每次都要手动刷新浏览器也很麻烦，能不能自动刷新？当然也可以。

借助 `webpack-dev-server` 启动一个本地服务器，可以实现自动刷新。

```sh
# 安装 webpack-dev-server
npm install --save webpack-dev-server
```

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundler.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        contentBase: './dist',
	      port: 8000
    }
}
```

然后修改 `package.json` 中的命令配置：

```json
// package.json
{
  //...
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server"
  },
  //...
}
```

执行 `npm run dev`，可以看到命令行启动了一个本地服务器，端口为 8000（如果被占用了，可以改成其他）。访问这个本地地址 `http://localhost:8000` ，可以看到之前的页面。试着手动修改一下 `src` 下的源文件，发现页面内容也自动跟着变了！

实际上 webpack 并没有重新刷新整个页面，而是使用了 **Hot Module Replacement (热更新，HMR)** 功能，自动更新部分代码。查看控制台中的网络请求，这个 websocket 连接就是用来热加载更新代码的。

![网页截图](https://cdn.bigliao.com/c6f697d7f9197d47b4099f096b083c87.png)

#### 图片资源

我想在 `html` 中放一只猫咪的图片，发现浏览器报错，找不到资源。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>webpack demo</title>
</head>
<body>
    <h1>webpack 揭秘（1）</h1>
    <img src="./cat2.jpg" alt="a cat" width="100%">
    <button type="button" id="btn">点击一下</button>
</body>
</html>
```

![页面截图](https://cdn.bigliao.com/07f6beb80cfed1c80de1521d3ae1c4ea.png)

因为 `cat2.jpg` 是放在 `src` 目录下的，而本地 8000 端口的服务器是`dist` 目录的，这样的请求连接当然是请求不到的。

我们需要 `html-loader` 和 `file-loader`，前者解析 `html` 中的 `img` 标签，后者负责把图片资源移动到目标文件夹。

```sh
# 安装
npm install -D html-loader file-loader
```

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundler.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        contentBase: './dist',
        port: 8000
    }
}
```

修改 `webpack.config.json` 文件后必须重启服务，`Ctrl+C` 关闭，然后 `npm run dev` 重新启动。

![页面截图](https://cdn.bigliao.com/6da02e09b9ff98e406891661c16dc0df.png)

## webpack 的配置

webpack 以配置复杂著称，好在实际开发中框架已经为我们做好了配置。实际上 webpack 4 可以开箱即用，默认配置的入口文件是 `src/index.js` 。

翻看文档的时候发现 webpack 官网[文档]([https://webpack.docschina.org/configuration/#%E9%80%89%E9%A1%B9](https://webpack.docschina.org/configuration/#选项))里已经做了非常棒的配置说明，这部分还是看文档吧哈哈哈！