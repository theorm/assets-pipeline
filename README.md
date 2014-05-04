assets-pipeline
===============

Assets pipeline for node.js


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
    productionPrefix: 'http://mycdn.com/myapp' // deployed are rendered with this prefix
});

// "/assets/app.js" or "http://mycdn.com/myapp/app.js"
console.log(assets.jsToHtml('app'));
console.log(assets.cssToHtml('app'));
console.log(assets.lessToHtml('app'));

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
    prefix: "/opt/myapp/assets"
 }
 ```

* scp

 Copy files remotely (See `scp2` npm module for more configuration options).

 ```js
 deployment: {
    method: "scp",
    prefix: "/opt/myapp/assets"
    host: "mycdn.com",
    username: "me",
    privateKey: require('fs').readFileSync("/Users/me/.ssh/id_rsa"),
 }
 ```

* s3

 Upload files to S3 (See `knox` npm module for more configuration options).

 ```js
 deployment: {
    method: "s3",
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: 'my-cdn-bucket',
    prefix: '/assets',
    headers: {'x-amz-meta-extra-header': 'bar'},
 }
 ```

