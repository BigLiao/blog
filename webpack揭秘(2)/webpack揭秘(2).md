---
title: webpack揭秘(2)——配置 Vue 工程
author: Bigliao
keywords: 前端 webpack
date: 2019-08-20
---

# webpack揭秘(2)——核心概念

> 我不生产内容，我只是文档的搬运工。

## 入口 (entry)

`entry` 就是 webpack 打包的入口，它指定了 webpack 从哪个文件开始着手，然后顺着这个入口文件开始查找依赖，根据得到的**依赖关系图**（dependancy graph）把所有所需的代码打包起来。

`entry` 是 webpack 必须的配置。如果没有配置 `webpack.config.js` 文件，那么 entry 的默认值是 `src/index.js`。

### context

**context** （上下文）是 webpack 查找文件时的根目录，默认为当前工作目录（CWD）。entry 和 output 指定的都是相对 context 的路径。

### entry 选项

`string | [string] | object { <key>: string | [string] } | (function: () => string | [string] | object { <key>: string | [string] })`

entry 可以接收字符串、对象、函数，或者它们的数组。

##### entry: string

```js
module.exports = {
  //...
  entry: 'src/main.js'
};
```

直接指定了入口文件。

##### entry: object

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

##### entry: function

如果传入的是一个函数，那么就成了**动态入口**。每当 `make` 事件触发的时候（比如开始运行或 watch 模式下文件变动时），这个函数就是执行一次。

函数可以直接返回入口文件地址字符串，也可以返回一个 `Promise` ，然后 `resolve` 入口文件地址。例如：

```js
module.exports = {
  //...
  entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
};
```

##### entry: array

也可以传入一个数组，元素可以是上面的三种类型。传入数组的话，相当于多入口打包。与对象的多入口不同的是，数组并不会做代码分割，仍然是一个 chunk。

## 出口 (output)

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

# 模块 (module)

Webpack 把一切资源都看作是模块（module），module 项是跟解析模块相关的配置。

### loader

Loader 是 webpack 最重要的概念之一，用于对加载模块。webpack 本身只支持 JS 和 JSON 文件，为了能够处理其他类型的模块，就要使用相应的 loader。loader 可以使你在 `import` 或"加载"模块时预处理文件，例如 `import` 一个 CSS 文件时，可以通过 `css-loader` 进行处理，它会把 CSS 编译到最终的 JS bundle 文件中。

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

如何配置 loader 呢？通常我们用 `module.rules`。

### module.rules

`module.rules` 里是一个规则（Rule）数组，用于匹配并处理不同的模块。通常用来配置 loader。Rule 的配置选项可以分为三类：条件(condition)，结果(result)和嵌套规则(nested rule)。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/, // condition
        use: [ // result
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
```



##### 条件选项 (condition rule)

筛选符合条件的模块用于结果。

`{ test: Condition }`：匹配特定条件。一般是提供一个正则表达式或正则表达式的数组，但这不是强制的。

`{ include: Condition }`：匹配特定条件。一般是提供一个字符串或者字符串数组，但这不是强制的。

`{ exclude: Condition }`：排除特定条件。一般是提供一个字符串或字符串数组，但这不是强制的。

`{ and: [Condition] }`：必须匹配数组中的所有条件。

`{ or: [Condition] }`：匹配数组中任何一个条件。

`{ not: [Condition] }`：必须排除这个条件。

其中 `Condition` 可以是这些之一：

- 字符串：匹配输入必须以提供的字符串开始。是的。目录绝对路径或文件绝对路径。
- 正则表达式：test 输入值。
- 函数：调用输入的函数，必须返回一个真值(truthy value)以匹配。
- 条件数组：至少一个匹配条件。
- 对象：匹配所有属性。每个属性都有一个定义行为。

多个条件选项可以一起使用，最终返回符合所有条件的模块。

##### 结果选项 (result rule)

当符合条件选项时使用。一般会用到 `use` 选项。

`use` 是一个数组，里面是`useEntry` 对象。

当 `use` 传字符串的时候，是 `useEntry`的简写方式。`use: [ 'style-loader' ]` 等价于 `use: [ { loader: 'style-loader'}`。

`useEntry.loader` 是必需项，需要我们手动安装相应的 loader。例如我们要使用 `css-loader`，先要 `npm install css-loader`。还可传入一个 `useEntry.options`对象，给 loader 传入参数（具体需看相应 loader 的文档）。

```js
module.exports = {
  //...
  module: {
    rules: [
      {
        loader: 'css-loader',
        options: {
          modules: true
        }
      }
    ]
  }
};
```

当有多个 `useEntry` 的时候，要记住执行顺序是相反的。

##### 嵌套规则 (nested rule)

可以使用 ``Rule.rules`` 和 `Rule.oneOf` ，实现嵌套的规则。`Rule.rules` 是同样参数的规则数组，与 `Rule.oneOf`的区别在于它会依次匹配数组里的选项，而后者匹配成功一次就就结束匹配了。比如：

```
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /inline/, // foo.css?inline
            use: 'url-loader'
          },
          {
            resourceQuery: /external/, // foo.css?external
            use: 'file-loader'
          }
        ]
      }
    ]
  }
};
```

一个常见的配置：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: ['babel-loader'],
      options:{
        cacheDirectory:true,
      },
      include: path.resolve(__dirname, 'src')
    },
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: path.resolve(__dirname, 'node_modules'),
    },
    {
      test: /\.(gif|png|jpe?g|eot|woff|ttf|svg|pdf)$/,
      use: ['file-loader'],
    },
  ]
}
```



## 插件 (plugin)

插件为 webpack 提供了丰富而强大的功能，你可以用它来实现各种功能。插件可以访问 webpack 的**整个**编译生命周期，所以在 loader 中无法实现的事情可以由插件来实现。

### 插件配置

插件的用法非常简单，`plugins` 接收的是一个插件数组，通常是 `new` 插件实例：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); //通过 npm 安装
const webpack = require('webpack'); //访问内置的插件

module.exports = {
  // ...
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};
```

插件有 webpack 内置的，也有大量是社区编写的，每个插件的使用需要去查看插件的文档。

### 常用插件

| Plugin Name                | Plugin Description                                           |
| :------------------------- | :----------------------------------------------------------- |
| HtmlWebpackPlugin          | 自动生成一个 HTML5 文件，并自动注入打包后的 bundle 资源。[查看](https://github.com/jantimon/html-webpack-plugin#options) |
| SplitChunksPlugin          | 替代`CommonsChunkPlugin` ，提取共用的代码块。[查看](https://webpack.docschina.org/plugins/split-chunks-plugin/) |
| DefinePlugin               | 创建一个在**编译**时可以配置的全局常量。在定义环境变量时非常有用，比如定义`process.env.NODE_ENV` 来区分生产环境和开发环境。[查看](https://webpack.js.org/plugins/define-plugin/) |
| MiniCssExtractPlugin       | 提取 CSS 到单独的`.css`文件。不使用这个插件的话 CSS 是打包在 JS bundle 里的。 |
| HotModuleReplacementPlugin | 开启热模块替换功能（HMR），需要阅读 webpack [文档](https://webpack.docschina.org/concepts/hot-module-replacement) |
|                            |                                                              |

## 解析 (resolve)

`resolve` 定义了一些查找模块时的选项，也就是去哪找、怎么找的问题。

### 路径别名 (alias)

 `resolve.alias` 接收一个对象，`key` 是路径别名，`value` 是路径的全名。对于常用的路径可以通过这个方式来简化引入文件时的写法，例如：

```js
module.exports = {
  //...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '_c': path.resolve(__dirname, 'src/components/')
    }
  }
};
```

那么在代码中就可这样写：

```js
import config from '@/config';
// 相当于 import config from 'rootDir/src/config'
import Button from '_c/button'
// 相当于 import Button from 'rootDir/src/components/button'
```

### 默认文件名 (mainFiles)

解析模块的时候，如果路径是一个文件夹，那么就会根据 `resolve.mainFiles` 的值来查找默认文件名。默认为：

```js
module.exports = {
  //...
  resolve: {
    mainFiles: ['index']
  }
};
```

也就是查找 `require('../config')`时，如果 `../config` 是一个文件夹，就默认找 `../config/index` 这个文件。

### 默认扩展名 (extensions)

用户在引入模块时可以不带扩展名，默认值是：

```js
module.exports = {
  //...
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json']
  }
};
```

如果用户这些写 `import util from './util'`，那么会依次尝试查找 `./util.wasm` 、`./util.mjs`、`./util.js`、`./util.json`，如果找到就结束。

### 第三方模块目录 (modules)

当我们在代码引入 npm 包时（例如 `import axios from 'axios'`），webpack 会自动从`node_modules` 文件夹查找，这个默认查找文件夹就是在这里配置的：

```js
module.exports = {
  //...
  resolve: {
    modules: ['node_modules']
  }
};
```

要注意的是，像上面这样写，webpack 的查找方式就跟 Node.js 一样，会一层层往上查找（即 `./node_modules`, `../node_modules` 等等）。如果写成绝对路径，就只找该路径。

可以配置多个路径，那么就会按照顺序优先级查找：

```js
module.exports = {
  //...
  resolve: {
    modules: [path.resolve(__dirname, 'src/components'), 'node_modules']
  }
};
```

