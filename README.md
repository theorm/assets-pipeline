assets-pipeline
===============

Smart assets pipeline for node.js. Minify, compile and deploy Javascript, CSS and Less locally, to S3 or via SCP. Cachebuster included.

Usage
=====

```js
var Assets = require("assets-pipeline").Assets;

var assets = new Assets({
    js: { // all .js files are minified using UglifyJS
        app: [ // files are merged to "js/app.js"
            "js/myapp.js"
        ],
        lib: [ // files are merged to "js/lib.js"
            "js/jquery.js",
            "js/angular.js"
        ]
    },
    css: { // all .css files are minified using clean-css
        app: [ // "css/app.css"
            "css/theme.css"
        ]
    },
    less: { // all .less files are converted to .css
        lib: [ // "css/lib.css"
            "less/theme.less"
        ]
    },
    statics: [ // static files are copied recursively
        "favico.ico", // a file
        "img" // a directory
    ],
    assetsDirectory: __dirname + "/assets", // where our source files are
    deployment: {
        method: "cp",
        prefix: "/opt/assets/"
    },
    production: process.env.NODE_ENV === 'production', // render sources or deployed
    localPrefix: '/assets', // sources are rendered with this prefix
    productionPrefix: 'http://mycdn.com/myapp', // deployed are rendered with this prefix
    useCachebuster: true // use git versin or Date() as css and js files suffix ("app.js" -> "app-12312312312312.js"). default false
    // lessScriptUrl: '/assets/js/less.js' // defaults to a cdn file
});

// "/assets/app.js" or "http://mycdn.com/myapp/app.js"
console.log(assets.jsToHtml('app'));
console.log(assets.cssToHtml('app'));
console.log(assets.lessToHtml('app'));
console.log(assets.staticUrl('favicon.ico'));

assets.deploy(function(err) {
  if (err) {
    console.log(err.stack)
    console.error(err);
    console.log("Not deployed");
  } else {
    console.log("Deployed!");
  }
});

```

Deployers
=========

 * cp

 Copy files locally.

 ```js
 deployment: {
    method: "cp",
    prefix: "/opt/myapp/assets", // directory where assets are uploaded
 }
 ```

* scp

 Copy files remotely (See [scp2](https://www.npmjs.org/package/scp2) npm module for more configuration options).

 ```js
 deployment: {
    method: "scp",
    prefix: "/opt/myapp/assets" // directory on the server where assets are uploaded
    host: "mycdn.com",
    username: "me",
    privateKey: require('fs').readFileSync("/Users/me/.ssh/id_rsa"),
 }
 ```

* s3

 Upload files to S3 (See [knox](https://www.npmjs.org/package/knox) npm module for more configuration options). The deployer will guess MIME type of each file and add a relevant `Content-Type` header.

 ```js
 deployment: {
    method: "s3",
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: 'my-cdn-bucket',
    prefix: '/assets', // prefix (directory) added to every file name.
    headers: {'x-amz-meta-extra-header': 'bar'}, // optional S3 metadata
    gzipContentTypes: ['text/css', 'application/javascript'], // gzip content of the files with the following type before uploading. This will also add 'Content-Encoding: gzip' to these files. By default the list is empty (nothing is gzipped).
 }
 ```

Example
=======

There is an example express application in [examples](./examples) directory to try it out.
