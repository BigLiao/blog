---
Title: "Chrome浏览器新原生文件接口"
Author: "BigLiao"
Date: 2019-10-27
---

# Chrome浏览器新原生文件接口

> Chrome浏览器最新的原生文件文件系统接口 (Native File System API) ，目前还在试验阶段，它可以让 Web 应用直接读写设备上的文件。

为了安全问题，Web 程序是不允许直接访问文件系统的。否则黑客可直接通过网页来获取你的文件内容了。所以，无论是读取文件内容，还是保存文件，都要经过用户允许。比如常用的上传和下载文件，都会出现一个弹窗让用户自己选择。这也是 Web 程序体验不如原生程序的地方。假如 Web 程序可以像原生程序一个直接读写文件，那么 Web 应用将有更多的机会替代原生应用，比如 IDEs，图片或者视频编辑器，文字编辑器等。

## 已有处理文件的接口

HTML5 里面增加了 **File API**，使我们可以很方便地处理文件。

### 通过表单选择文件

通过 `type=file` 的 `input` 标签，可以获取 `File` 对象。例如，

```html
<input type="file" id="input">
```

```js
const selectedFile = document.getElementById('input').files[0];
```

或者通过监听 `change` 事件：

```js
<input type="file" id="input" onchange="handleFiles(this.files)">
```

### 通过拖拽

把文件直接拖拽到网页的目标区域，通过监听目标区域元素的 `drop` 事件，可以获得 `File` 对象。

```html
<div id=dropbox>
  拖拽文件到这里
</div>
```

```js
const dropbox = document.getElementById("dropbox");
dropbox.addEventListener("drop", drop, false);

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  const dt = e.dataTransfer;
  const files = dt.files;

  handleFiles(files);
}
```

这里的`files` 就是包含 `File` 对象的数组。

### File 对象

`File` 对象其实是继承自 `Blob`，也就是说它包含所有 `Blob` 对象的方法和属性。除此之外，`File` 对象还有下面几个*只读*属性：

- `File.lastModified`: 文件最后修改时间，UNIX 时间戳
- `File.name`: 文件名
- `File.size`: 文件大小，字节数
- `File.type`: 返回文件的 MIME 类型



这些是目前盛行的处理文件的方法。

## Chrome浏览器原生文件接口

原生文件系统接口 (Native File System API) ——以前被称为可写入文件接口 (Writeable Files API)——目前还是 Chrome 浏览器上的一个试验接口，在 Chrome 78 以及更高版本中可用。

这个原生文件接口让 Web 应用能够直接与文件系统进行交互，可以直接读取和保存文件而不用经过用户授权。

### 开启原生文件接口

由于这个接口还在试验阶段，所以还不能直接使用。需要一些操作来开启这个接口。注意，这个接口只能在 Chrome 浏览器使用。

#### 本地开启

如果想在本地环境里体验这个接口，可以在 Chrome 浏览器里面打开地址 `chrome//flags` ，里面有很多实验性选项，开启 `#native-file-system-api` 即可。

开启以后，通过 Chrome 直接打开本地网页有效，或者开启本地服务器，通过 `localhost` 域名访问。

#### 获取试用

你可以向 Chrome 申请接口试用，这样所有 Chrome 78 版本以上的用户都能体验最新的接口。

**起源试用** ([origin trial](https://www.chromium.org/blink/origin-trials/running-an-origin-trial)) 是 Chrome 官方提供的功能，让开发者可以试用最新功能并且可以收集反馈。具体如何申请可以看官方说明： [Origin Trials Guide for Web Developers](https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md)。

1. 首先[注册](https://developers.chrome.com/origintrials/#/view_trial/3868592079911256065)一个试用 Token。

2. 然后把 Token 添加到页面上。有两种做法：

   - 增加一个`origin-trial` 的  `<meta>` 标签，像这样：

     ```html
     <meta http-equiv="origin-trial" content="TOKEN_GOES_HERE">
     ```

   - 通过配置服务器，在 HTTP 响应头部增加 `Origin-Trail` 字段：

     ```
     Origin-Trial: TOKEN_GOES_HERE
     ```

### 通过原生文件接口读取本地文件

原生文件接口中获取文件的接口是 `window.chooseFileSystemEntries()`。调用这个方法后浏览器会弹出一个选择框，提示用户选择文件。选择完成后会返回一个文件处理对象。这个方法接收一个 `options` 参数，可以配置选择多个文件、选择文件夹，或者标明文件类型。

需要注意的是，这个接口必须在安全上下文（[secure context](https://w3c.github.io/webappsec-secure-contexts/)）中执行，并且必须由用户主动操作来触发。

> 安全上下文指的是网页的资源和通信都通过 HTTPS/TLS 分发，确保网页处于一种安全环境。许多强大的 API 都要求在安全上下文中执行，这主要是为了防止中间人攻击。

```js
let fileHandle;
butOpenFile.addEventListener('click', async (e) => {
  fileHandle = await window.chooseFileSystemEntries();
  // 使用 fileHandle 处理文件
});
```

`fileHandle` 对象是 [`FileSystemFileHandle`](https://wicg.github.io/native-file-system/#api-filesystemfilehandle) 的实例，它具备操作文件的方法。`fileHandle.getFile()` 返回一个 `File` 对象（与前文的 `File` 对象相同），可以调用 `Blob` 的方法来获取文件内容。

```js
const file = await fileHandle.getFile();
const contents = await file.text();
```

### 新建文件

通过给 `chooseFileSystemEntries()` 传入 options 对象 `{type: 'saveFile'}` 会触发保存文件的弹窗。例如：

```js
function getNewFileHandle() {
  const opts = {
    type: 'saveFile',
    accepts: [{
      description: 'Text file',
      extensions: ['txt'],
      mimeTypes: ['text/plain'],
    }],
  };
  const handle = window.chooseFileSystemEntries(opts);
  return handle;
}
```

### 保存文件变化

要写入文件到磁盘，需要一个  [`FileSystemWriter`](https://wicg.github.io/native-file-system/#filesystemwriter)，可以通过 `fileHandle.createWriter()` 创建。如果没有获得该文件的权限的话，会弹窗提示用户。

```js
async function writeFile(fileHandle, contents) {
  const writer = await fileHandle.createWriter();
  
  // 擦除文件内容
  await writer.truncate(0);
  
  // 写入数据到文件中
  await writer.write(0, contents);

  // 关闭文件
  await writer.close();
}
```

### 打开目录

将 `chooseFileSystemEntries(options)` options 中的 `type` 设置为 `openDirectory` 可以打开目录。返回的是 [`FileSystemDirectoryHandle`](https://wicg.github.io/native-file-system/#api-filesystemdirectoryhandle) 对象，跟 FileSystemFileHandle 差不多，`getEntries()` 可以获取目录下所有文件。

```js
const butDir = document.getElementById('butDirectory');
butDir.addEventListener('click', async (e) => {
  const opts = {type: 'openDirectory'};
  const handle = await window.chooseFileSystemEntries(opts);
  const entries = await handle.getEntries();
  for await (const entry of entries) {
    const kind = entry.isFile ? 'File' : 'Directory';
    console.log(kind, entry.name);
  }
});
```

## 示例：文字编辑器

Chrome 团队针对原生文件接口写了一个文字编辑器的示例，可以直接去里面 copy 代码。

可以在线访问 [https://googlechromelabs.github.io/text-editor/](https://googlechromelabs.github.io/text-editor/)。源代码地址：[https://github.com/googlechromelabs/text-editor/](https://github.com/googlechromelabs/text-editor/)。

## 总结

在 Web 中操作文件是一种常见需求。随着 Web 应用越来越强大，对原生文件接口的需求也越来越迫切。目前这个接口还处于试验阶段，可以尝个鲜，或者在公司内部系统中使用。