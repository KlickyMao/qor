你好！
很冒昧用这样的方式来和你沟通，如有打扰请忽略我的提交哈。我是光年实验室（gnlab.com）的HR，在招Golang开发工程师，我们是一个技术型团队，技术氛围非常好。全职和兼职都可以，不过最好是全职，工作地点杭州。
我们公司是做流量增长的，Golang负责开发SAAS平台的应用，我们做的很多应用是全新的，工作非常有挑战也很有意思，是国内很多大厂的顾问。
如果有兴趣的话加我微信：13515810775  ，也可以访问 https://gnlab.com/，联系客服转发给HR。
# QOR

English Chat Room: [![Join the chat at https://gitter.im/qor/qor](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/qor/qor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

中文聊天室： [![加入中国Qor聊天室 https://gitter.im/qor/qor/china](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/qor/qor/china)


[![Build Status](https://semaphoreci.com/api/v1/projects/3a3db8d6-c6ac-46b8-9b34-453aabdced22/430434/badge.svg)](https://semaphoreci.com/theplant/qor)

## What is QOR?

QOR is a set of libraries written in Go that abstracts common features needed for business applications, CMSs, and E-commerce systems.

This is actually the third version of QOR: 1 and 2 were written in Ruby and used internally at [The Plant](https://theplant.jp).
We decided to rewrite QOR in Go and open source it - which has happened as of June 2015.

QOR is still beta software - we will probably break an API or two before we release a stable 1.0 (scheduled for September 2015).

While nearing API freeze our other main focus is building up API documentation for each module and a tutorial that will eventually cover features from most of the modules.

### What QOR is not

QOR is not a "boxed turnkey solution". You need proper coding skills to use it. It's designed to make the lives of developers easier when building complex EC systems, not providing you one out of the box.

## The modules

* Admin - The heart of any QOR system, where you manage all your resources

* Publish - Providing a staging environment for all content changes to be reviewed before being published to the live system

* Transition - A configurable State Machine: define states, events (eg. pay order), and validation constraints for state transitions

* Media Library - Asset Management with support for several cloud storage backends and publishing via a CDN

* Worker (Batch processing) - A process scheduler

* Exchange - Data exchange with other business applications using CSV or Excel data

* Internationalization (i18n) - Managing and (inline) editing of translations

* Localization (l10n) - Manage DB-backed models on per-locale basis, with support for defining/editing localizable attributes, and locale-based querying

* Roles - Access Control


## API Documentation

We are planning to update the godoc documentation for all modules after the API for the 1.0 release is frozen. Still outstanding are:

* [ ] Admin
* [ ] Publish
* [ ] Transition
* [ ] Media Library
* [ ] Worker
* [ ] Exchange
* [ ] Internationalization (i18n)
* [ ] Localization (l10n)
* [ ] Roles


## Example Application

[The example application](https://github.com/qor/qor-example) is a work in progress but already covers the following modules:

* [x] Setup & Installation
* [x] Define a first set of resources (qor/admin)
* [x] Introduce Meta - Back Office display control for your resources
* [x] Basic Media library usage
* [x] Using Publish
* [x] L10n & I18n
* [\] Roles (very little)
* [ ] Worker


## Front End Build

### Main

Main asset directories of Admin and other modules:

```
/
├── admin/views/assets/
│   ├── fonts
│   ├── images
│   ├── javascripts
│   └── stylesheets
│
├── i18n/views/themes/i18n/assets/
│   ├── javascripts
│   └── stylesheets
│
├── l10n/views/themes/l10n/assets/
│   ├── javascripts
│   └── stylesheets
│
└── publish/views/themes/publish/assets/
    ├── javascripts
    └── stylesheets
```


### Build

> Requires [Node.js](https://nodejs.org/) (with [NPM](https://www.npmjs.com/) built-in) development environment.


#### Install [Gulp](http://gulpjs.com/)

```bash
npm install -g gulp
```

#### Install dependencies

```bash
npm install
```

#### Run Admin tasks

- Watch: `gulp`
- Build JS: `gulp js`
- Build CSS: `gulp css`
- Compile SCSS: `gulp sass`
- Release: `gulp release`


#### Run module tasks

Take I18n module for example:

- Watch: `gulp --i18n`
- Build JS: `gulp js --i18n`
- Build CSS: `gulp css --i18n`
- Compile SCSS: `gulp sass --i18n`
- Release: `gulp release --i18n`
