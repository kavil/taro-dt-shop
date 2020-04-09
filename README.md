# 前言

**Taro** 是一套遵循 [React](https://reactjs.org/) 语法规范的 **多端开发** 解决方案。现如今市面上端的形态多种多样，Web、React-Native、微信小程序等各种端大行其道，当业务要求同时在不同的端都要求有所表现的时候，针对不同的端去编写多套代码的成本显然非常高，这时候只编写一套代码就能够适配到多端的能力就显得极为需要。

使用 **Taro**，我们可以只书写一套代码，再通过 **Taro** 的编译工具，将源代码分别编译出可以在不同端（微信/百度/支付宝小程序、H5、React-Native 等）运行的代码。

# 技术栈

React + Taro + Dva + Sass + TS


命令行快速生成模板页面
npm tpl 'page-name'

自动从iconfont更新
npm icon 'iconfont下载链接后缀'

node >= 12.0.0

Taro >= v2.0.0


## 项目运行


```

cd taro-dva-ts

# 安装项目依赖
yarn

# 微信小程序
npm run dev:weapp

# 支付宝小程序
npm run dev:alipay

# 百度小程序
npm run dev:swan

# 字节跳动小程序
npm run dev:tt

# QQ小程序
npm run dev:qq

# H5
npm run dev:h5

# React Native
npm run dev:rn

# pages模版快速生成
npm run tpl `文件名`

```

## 项目说明

**git分支说明：**

  init：框架整体结构，不涉及任何业务逻辑

  master：项目的稳定版本
  
  feature：项目开发分支


# 业务介绍

目录结构

    ├── .temp                  // H5编译结果目录
    ├── .rn_temp               // RN编译结果目录
    ├── dist                   // 小程序编译结果目录
    ├── config                 // Taro配置目录
    │   ├── dev.ts                 // 开发时配置
    │   ├── index.ts               // 默认配置
    │   └── prod.ts                // 打包时配置
    ├── src                    // 源码目录
    │   ├── components             // 组件
    │   ├── config                 // 项目开发配置
    │   ├── models                 // redux models
    │   ├── pages                  // 页面文件目录
    │   │   └── account
    │   │       ├── index.ts           // 页面逻辑
    │   │       ├── index.scss         // 页面样式
    │   ├── service            // 页面api等服务
    │   ├── static             // 字体、图片
    │   ├── utils              // 常用工具类
    │   ├── app.ts             // 入口文件
    │   └── index.html
    ├── package.json
    ├── template.ts            // pages模版快速生成脚本,执行命令 npm run tpl `文件名`
    └── get-iconfont.ts        // iconfont快速更新,执行命令 npm run iconfont

# 文档

### Taro开发文档

> https://nervjs.github.io/taro/docs/README.html

### dva开发文档地址

> https://dvajs.com/

### 小程序开发文档

> https://mp.weixin.qq.com/debug/wxadoc/dev/

# License

[MIT](LICENSE)
