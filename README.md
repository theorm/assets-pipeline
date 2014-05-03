assets-pipeline
===============

Assets pipeline for node.js


Usage
=====

Initialize assets like this:

```js
var assets = new Assets({
    js: {
        app: [
            "js/myapp.js"
        ],
        lib: [
            "js/jquery.js",
            "js/angular.js"
        ]
    },
    css: {
        app: [
            "css/theme.css"
        ]
    },
    less: {
        lib: [
            "less/theme.less"
        ]
    },
    statics: [
        "favico.ico",
        "img"
    ],
    assetsDirectory: __dirname + "/assets",
    deployment: {
        method: "cp",
        location: "/opt/assets/"
    },
    production: process.env.NODE_ENV === 'production',
    localPrefix: '/assets',
    productionPrefix: 'http://mycdn.com/myapp'
});

assets.jsAsHtml("app");

```