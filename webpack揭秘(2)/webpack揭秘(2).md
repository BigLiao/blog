---
title: webpack揭秘(2)——配置 Vue 工程
author: Bigliao
keywords: 前端 webpack
date: 2019-08-20
---

# webpack揭秘(2)——核心概念

> 我不生产内容，我只是文档的搬运工。

## entry

**entry** 就是 webpack 打包的入口，它指定了 webpack 从哪个文件开始着手，然后顺着这个入口文件开始查找依赖，根据得到的**依赖关系图**（dependancy graph）把所有所需的代码打包起来。

### context

entry 是 webpack 必须的配置。如果没有配置 `webpack.config.js` 文件，那么 entry 的默认值是 `src/index.js`。

**context** （上下文）是 webpack 查找文件时的根目录，默认为当前工作目录（CWD）。entry 和 output 指定的都是相对 context 的路径。

### entry 选项

`string | [string] | object { <key>: string | [string] } | (function: () => string | [string] | object { <key>: string | [string] })`

entry 可以接收字符串、对象、函数，或者它们的数组。

#### 字符串

```js
module.exports = {
  //...
  entry: 'src/main.js'
};
```

直接指定了入口文件。

#### 对象

接收对象作为参数的话，key 是 **chunk**（代码块） 的名字，value 就是该 chunk 的入口文件。也就是说，webpack 会对每个 value 进行分析打包，最后生成对应以 key 为名字的包文件。例如，

```js
module.exports = {
  //...
  entry: {
    home: './home.js',
    about: './about.js',
    contact: './contact.js'
  }
};
```

最终会生成三个 `bundle` 文件。对于多页应用，或者多个 SPA ，可以使用这种方式。同时这也是一种代码分割方式。

### 函数

如果传入的是一个函数，那么就成了**动态入口**。每当 `make` 事件触发的时候（比如开始运行或 watch 模式下文件变动时），这个函数就是执行一次。

函数可以直接返回入口文件地址字符串，也可以返回一个 `Promise` ，然后 `resolve` 入口文件地址。例如：

```js
module.exports = {
  //...
  entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
};
```

### 数组

也可以传入一个数组，元素可以是上面的三种类型。传入数组的话，相当于多入口打包。与对象的多入口不同的是，数组并不会做代码分割，仍然是一个 chunk。

## output

output 接收一个对象，配置输出相关的内容。一个最常用的 output 配置如下：

```js
module.exports = {
  //...
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: 'https://cdn.example.com/assets/'
  }
};
```



### output.path

一个存放输出文件的**绝对路径**。

```js
module.exports = {
  //...
  output: {
    path: path.resolve(__dirname, 'dist/assets')
  }
};
```

### output.filename

输出的`bundle`的文件名。当通过多个入口起点(entry point)、代码拆分(code splitting)或各种插件(plugin)创建多个 bundle，应该对应唯一的文件名。通过`[name]` 可以将 bundle 命名为 chunk 的名字（如果只有一个 chunk 的话，默认是 `main`）。使用 `[hash]` 可以为每次打包生成一个 hash，可用于缓存管理。可以使用以下替换模板字符串：

|    模板     |                       描述                       |
| :---------: | :----------------------------------------------: |
|   [hash]    |       模块标识符(module identifier)的 hash       |
| [chunkhash] |                chunk 内容的 hash                 |
|   [name]    |                     模块名称                     |
|    [id]     |          模块标识符(module identifier)           |
|   [query]   |   模块的 query，例如，文件名 `?` 后面的字符串    |
| [function]  | The function, which can return filename [string] |

`[hash]` 和 `[chunkhash]` 的长度可以使用 `[hash:16]`（默认为20）来指定。比较常用的 filename 配置是：

```js
module.exports = {
  //...
  output: {
    filename: '[name].[chunkhash].js'
  }
};
```

### output.publicPath

打包后的时候资源放在服务器上的路径。一般只在生产环境模式下配置。在 HTML 引入资源（如 JS、CSS、图片等）都会根据这个路径来解析。使用代码分割后异步加载的 JS 文件也是相对这个路径。

publicPath 可以是一个本地（服务器上的）路径，也可以是一个 URL，不同情况下的含义也不一样：

```js
module.exports = {
  //...
  output: {
    // One of the below
    publicPath: 'https://cdn.example.com/assets/', // CDN（总是 HTTPS 协议）
    publicPath: '//cdn.example.com/assets/', // CDN（协议相同）
    publicPath: '/assets/', // 相对于服务(server-relative)
    publicPath: 'assets/', // 相对于 HTML 页面
    publicPath: '../assets/', // 相对于 HTML 页面
    publicPath: '', // 相对于 HTML 页面（目录相同）
  }
};
```

通常我们会把静态资源放到 CDN 上，那么这里就要配置为 CDN 的基础 URL。

# module

Webpack 把一切资源都看作是模块（module），module 项是跟解析模块相关的配置。

### loader

Loader 是 webpack 非常重要的概念，用于对模块的源代码进行转换。webpack 本身只支持 JS 和 JSON 文件，为了能够处理其他类型的模块，就要使用相应的 loader。loader 可以使你在 `import` 或"加载"模块时预处理文件，例如 `import` 一个 CSS 文件时，可以通过 `css-loader` 进行处理，它会把 CSS 编译到最终的 JS bundle 文件中。

通过 `module.rules` 来配置解析模块所需的 loader。例如要解析 `scss` 文件，需要安装 `sass-loader`、`css-loader`、`style-loader`，它们要按照一定的顺序排列：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s(c|a)ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
```

这里要注意的是，配置 loader 与执行的顺序是相反的——**从下往上**执行，先执行 `sass-loader` 把 SASS 转换成 CSS，最后由 `style-loader` 把 CSS 注入到 HTML 中。

也可以使用内联（inline）配置。在`import`语句中指定 loader，使用 `!` 分隔不同的 loader，如：

```js
import styles from 'style-loader!css-loader!sass-loader!./styles.scss';
```



### module.rules

我们通过



## plugin

