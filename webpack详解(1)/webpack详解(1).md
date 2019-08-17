# webpack详解(1)

> 放心，其实我也记不住webpack的配置:)

## webpack简介

![webpack banner](/Users/liao/Desktop/Screen Shot 2019-08-17 at 11.16.07.png)

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



## webpack干了什么

