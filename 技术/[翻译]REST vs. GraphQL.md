---
Title: "[翻译]REST vs. GraphQL"
Author: "Sebastian Eschweiler"
Translator: BigLiao
OriginalURL: "https://medium.com/codingthesmartway-com-blog/rest-vs-graphql-418eac2e3083"
Date: 2019-07-29
---

# [翻译]REST vs. GraphQL

*This post has been published first on* [*CodingTheSmartWay.com*](http://codingthesmartway.com/)

[**去 YouTube 上订阅原作者**](https://www.youtube.com/channel/UCLXQoK41TOcIsWtY-BgB_kQ?sub_confirmation=1)

REST 和 GraphQL 是 HTTP 请求数据的两种方式。基于 REST 的（REST-based）是传统的方式，最近几年采用这种技术栈的比例比非常高。

GraphQL 的出现则是以一种革新的方式来对待 API。实际上 GraphQL 能够克服 REST 的主要缺点。通过本教程你能知道到这两种技术之间的区别，并且通过许多实际例子，让你懂得为什么 GraphQL 能够为你的应用建立高灵活性的 API 接口。让我们开始吧…...

## REST 介绍及其缺点

REST 全称是资源状态转移（Representational State Transfer），它是应用在 Web 服务中的一种 API 设计模式。符合 REST API 的（RESTful） Web 服务，允许请求方使用统一的、预先设定的一系列无状态（stateless）操作，来获取和操作 Web 资源的文本表示（textual representations）。如果使用 HTTP 协议的话，最常用的操作就是 GET，POST，PUT 和 DELETE。

REST 的核心概念为一切都是资源。虽然 REST 在最初提出的时候是一种很好的解决方案，但是依然有许多重大问题，让这种设计模式至今诟病不已。现在我们就来看看 REST 的一些重大缺陷：

### 多次请求才能获得想要的资源

如今的很多网站和移动应用都是数据驱动的，需要大量的数据，这些数据来自不同的资源。通过 REST-based API 来获取这些数据往往需要我们经过多个轮次的请求，才能获得我们想要的所有东西。举个例子，假设你获取一条帖子（post）的实体，同时又要获取这条帖子作者信息（假设这两个是分开的），最典型的做法就是向 REST API 发送两条请求到（比如用 HTTP GET），第一个获取帖子内容，第二个获得作者信息，假设端点（endpoint）分别是：

`mydomain.com/posts/:id`

`mydomain.com/users/:id`

### 过度请求/不足请求

使用 RESTful 服务的另一个常见问题是关于*过度请求*和*不足请求*的问题。具体是什么意思呢？我们再回到之前的例子。我们通过 `mydomain.com/posts/:id` 获得某条帖子的内容，每条帖子由`id`、`title`、`user`和`body`这些属性组成，你每次都会返回这些数据的整个集合，没有办法缩减只返回数据的部分子集，比如只包含`title`和`user`。

### 举例

有一个叫 *JSONPlaceholder* 的网站可以测试 REST API 使用：

https://jsonplaceholder.typicode.com/ 

![](https://cdn.bigliao.com/fa65a2c695603271a430f7672a4f2693.png)

JSONPlaceholder 的 API 提供了许多端点（endpoint），或者称作资源（resource），例如：

- /posts
- /comments
- /users
- ...

想获取某条 post 的话，可通过这条 URL： `https://jsonplaceholder.typicode.com/posts/1` 来发送一个 HTTP GET 请求，这会请求 ID 为 1 的 post。你可以用 Postman 来发送这个请求：

![](https://cdn.bigliao.com/908ab974056861df36903a78efa2bc1b.png)

返回的 JSON 对象包含了以下 post 数据：`id`，`title`，`user`，`body`。如上所述，请求某个具体 post 总是返回整个数据集合。

如果你现在想知道相应作者的信息，那么你就要再发送一条 GET 请求到服务器，请求 id 为 1 的 user 详情。所以你需要发送这个请求：`https://jsonplaceholder.typicode.com/users/1`：

![](https://cdn.bigliao.com/a891e7fac0d806e8828d0e16826befc5.png)

使用 REST 的方式，需要通过两轮到服务器的请求才能获取帖子和相应的作者信息。

## GraphQL —— 一种不一样的方式

与 REST 类似，GraphQL 也是一种 API 设计模式，但是是一种不同的方式，它要灵活得多。**最主要和最重要的区别是，GraphQL 不是用来处理某个专用资源的，而是把所有东西作为相互连接的图来看待。**这意味着你可以裁剪请求来获得精确的需求。你可以使用 GraphQL 查询语句来描述你想要的答案。你可以组合不同的实体（entity）到一个请求中，并且能够指定每个层级需要包含的属性，例如：

```
{
     post(id: 1) {
        title
        user {
            name
            email
            courses {
                title
            }
        }
     }
}
```

### 举例

我们来看一些实际的例子。首先我们要设置一个能提供 post 和 user 数据的 GraphQL 服务（这样我们才能和之前的 REST 例子作对比）。

通过 [Apollo Launchpad](https://launchpad.graphql.com) 很容易创建一个简单的 GraphQL 服务。

> 译者注：Apollo Launchpad 已不再提供服务，推荐使用 CodeSandbox

![](https://cdn.bigliao.com/03110b8e6f8842a4fc7c96e0efedbe9d.png)

下面使用 CodeSandbox 进行演示。通过这个链接可以打开写好的例子：

 https://codesandbox.io/embed/apollo-server-t6crq

![](https://cdn.bigliao.com/8a53cd7276fcc934f80352bc5891aaed.png)

你可以直接使用上面的链接，或者自己实现一个服务。下面是相应的 `JavaScript` 代码：

```javascript
const { ApolloServer, gql } = require("apollo-server");
const { find, filter } = require('lodash');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    post(id: Int!): Post
    user(id: Int!): User
  },
  type Post {
    id: Int
    user: User
    title: String
    body: String
  },
  type User {
    id: Int
    name: String
    email: String
    posts: [Post]
  },
`;

var postsData = [
{
  id: 1,
  userId: 1,
  title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
  body: 'quia et suscipitsuscipit recusandae consequuntur expedita et cumreprehenderit molestiae ut ut quas totamnostrum rerum est autem sunt rem eveniet architecto'
},
{
  userId: 2,
  id: 2,
  title: 'qui est esse',
  body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
},
{
  userId: 1,
  id: 3,
  title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
  body: 'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut'
},
{
  userId: 2,
  id: 4,
  title: 'eum et est occaecati',
  body: 'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit'
}
];
var usersData = [
{
  id: 1,
  name: 'Leanne Graham',
  email: 'Sincere@april.biz'
},
{
  id: 2,
  name: 'Ervin Howell',
  email: 'Shanna@melissa.tv'
}
];
var getPost = function(root, {id}) { 
  return postsData.filter(post => {
    return post.id === id;
  })[0];
};
var getUser = function(root, {id}) {
  return usersData.filter(user => {
    return user.id === id;
  })[0];
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    post: getPost,
    user: getUser,
  },
  User: {
    posts: (user) => filter(postsData, { userId: user.id }),
  },
  Post: {
    user: (post) => find(usersData, { id: post.userId }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

```

现在我们已经准备好可以执行一些查询来从这个 GraphQL 服务获取数据了。直接在右侧的浏览器输入框中输入查询代码：

```
# Write your query or mutation here
query PostsAndUser {
  post(id:1){
    id
    title
  }
}
```

执行这个查询预计可以获得数据如下：

```json
{
  "data": {
    "post": {
      "id": 1,
      "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
    }
  }
}
```

![](https://cdn.bigliao.com/f8ad0dfdc344dbee8111184a3eb01fde.png)

只需要一个请求，我们就能同时获得`post`和`user`这两个内容。

当然我们也能获得更多的内容，只需要在相应的地方增加字段：

```
query PostsAndUser {
  post(id:1){
    id
    title
    user {
      id
      name
      email
    }
  }
}
```

返回结果就包含了所请求的数据：

```json
{
  "data": {
    "post": {
      "id": 1,
      "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      "user": {
        "id": 1,
        "name": "Leanne Graham",
        "email": "Sincere@april.biz"
      }
    }
  }
}
```

为了闭环（译注：To close the circle，我也不懂）我们甚至可以拓展查询字段，让它包含这个 `user` 的 `post` 列表：

```javascript
query PostsAndUser {
  post(id:1){
    id
    title
    user {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
}
```

结果应当如下所示：

```json
{
  "data": {
    "post": {
      "id": 1,
      "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      "user": {
        "id": 1,
        "name": "Leanne Graham",
        "email": "Sincere@april.biz",
        "posts": [
          {
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
          },
          {
            "id": 3,
            "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut"
          }
        ]
      }
    }
  }
}
```

这个 `posts` 列表来自指定 `user`，`user` 又根据最初始的 `post` 而来。现在我们可以对这个 `posts` 列表查询进行拓展，请求每个 `post` 的 `id`、`title` 和 `user` 信息：

```
query PostsAndUser {
  post(id:1){
    id
    title
    user {
      id
      name
      email
      posts {
        id
        title
        user {
          name
        }
      }
    }
  }
}
```

结果应当如下所示：

```json
{
  "data": {
    "post": {
      "id": 1,
      "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      "user": {
        "id": 1,
        "name": "Leanne Graham",
        "email": "Sincere@april.biz",
        "posts": [
          {
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "user": {
              "name": "Leanne Graham"
            }
          },
          {
            "id": 3,
            "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
            "user": {
              "name": "Leanne Graham"
            }
          }
        ]
      }
    }
  }
}
```

通过执行上述查询例子，你应该对 GraphQL 之间的实体（entity）是如何连接的有了一个基本概念，同时你能够利用 “Graph（图）” 中的连接来组合不同实体之间的数据。下面这张图片用图形化的方式展示了前面的例子所用到的 *图*：

![](https://cdn.bigliao.com/cb514596b3f2a98a7be98cb54b95c8cf.png)

目前我们所有的查询例子都使用图中相同的入口：ID 为 1 的 `post`。当然我们也可以用其他入口，像在下面这个例子中看到的一样：

```
query UsersAndPosts {
    user(id:2) {
    id
    name
  }
}
```

这里我们使用 `user` 实体作为开始，请求了 ID 为 2  的 `user` 的 `id` 和 `name` ，结果应该如下所示：

```json
{
  "data": {
    "user": {
      "id": 2,
      "name": "Ervin Howell"
    }
  }
}
```

从 `user` 实体入口我们可以在*图*中导航到 `post` 实体：

```
query UsersAndPosts {
    user(id:2) {
    id
    name
    posts {
      title
    }
  }
}
```

然后我们就能看到 `post` 列表包含在所请求的 `user` 中：

```json
"data": {
    "user": {
      "id": 2,
      "name": "Ervin Howell",
      "posts": [
        {
          "title": "qui est esse"
        },
        {
          "title": "eum et est occaecati"
        }
      ]
    }
  }
```

## 总结

REST 和 GraphQL 都是可以用来构建数据驱动的 Web 服务的 API 设计模式。通过这个教程你已经知道了这两者之间的主要区别。RESTful 的方式通常仅限于处理单个资源。如果你需要的数据是来自两个或更多资源（例如 `posts` 和 `users`），你就需要做多个轮次的请求。此外，REST 请求往往返回某个资源的整个数据集合，没有办法缩减请求使它只包含部分字段的数据子集。

GraphQL 则更加灵活，如本文展示的那样，它能克服 REST 的主要缺点。使用 GraphQL 查询语句，你能够精确地描述出你想要返回结果应该长什么样。你能够指出应该包含哪些字段，使响应体缩减成你想要的数据。除此之外，你能够使用*图*来在一个 GraphQL 查询中组合已连接的实体，不需要额外轮次的查询。

原文地址：https://medium.com/codingthesmartway-com-blog/rest-vs-graphql-418eac2e3083