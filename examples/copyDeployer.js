var Assets = require("..").Assets;

var assets = new Assets({
  js: {
    app: ["js/foo.js"]
  },
  css: {
    app: ["css/bar.css"]
  },
  less: {
    lib: ["less/baz.less"]
  },
  statics: [
    'favicon.ico',
    'txt/'
  ],
  assetsDirectory: __dirname + "/assets",
  deployment: {
      method: "cp",
      location: "/tmp/assets-test"
  },
  localPrefix: '/assets',
  productionPrefix: 'http://mycdn.com/myapp',
  useCachebuster: true
});

console.log(assets.jsToHtml('app'));
console.log(assets.cssToHtml('app'));
console.log(assets.lessToHtml('app'));

assets.deploy(function(err) {
  if (err) {
    console.log(err.stack)
    console.error(err);
    console.log("Not done");
  } else {
    console.log("Done");
  }
});
