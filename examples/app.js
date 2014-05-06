var express = require('express')
  , Assets = require("..").Assets
  , path = require("path")
  , fmt = require('util').format
  , Colors = require('colors');

var app = express();

// some global variables

// port where the app runs
var port = 3000;
// set NODE_ENV to 'production' to see compiled assets
var isProduction = process.env.NODE_ENV === 'production';
// where we copy compiled assets
var productionAssetsLocation = '/tmp/assets-pipeline-test-assets';
// where we serve assets in development mode.
var assetsPrefix = '/assets';
// our 'cdn' where we serve compiled assets from
var productionAssetsUrl = fmt('http://localhost:%s%s', port, assetsPrefix)
// var productionAssetsUrl = "http://s3.amazonaws.com/theorm-test/foo"

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (isProduction)
  app.use(assetsPrefix, express.static(productionAssetsLocation));
else
  app.use(assetsPrefix, express.static(__dirname + '/assets'));

// configure assets
var assets = new Assets({
  js: {
    // two js files that should be compiled into one for production
    app: [
      "js/foo.js",
      "js/bar.js"
    ]
  },
  css: {
    // one css file that is called 'css/lib.css' in production
    lib: ["css/bar.css"]
  },
  less: {
    // one less file that is called 'css/app.css' in production
    app: ["less/baz.less"]
  },
  // a static file and a static directory that are copied into production directory
  statics: [
    'favicon.ico',
    'txt/'
  ],
  // where assets are located in the project
  assetsDirectory: __dirname + "/assets",
  // deploy compiled assets to a local directory.
  deployment: {
      method: "cp",
      prefix: productionAssetsLocation
  },
  // deployment: {
  //   method: "s3",
  //   key: process.env.S3_KEY,
  //   secret: process.env.S3_SECRET,
  //   bucket: 'theorm-test',
  //   prefix: '/foo',
  //   headers: {'x-amz-meta-custom-header': 'foo bar'},
  //   gzipContentTypes: ['text/css', 'application/javascript', 'image/x-icon']
  // },
  // deployment: {
  //   method: "scp",
  //   host: "localhost",
  //   username: "roman",
  //   privateKey: require('fs').readFileSync("/Users/roman/.ssh/id_rsa"),
  //   prefix: "/tmp/scp-assets"
  // },
  localPrefix: assetsPrefix, // where we serve assets in development
  productionPrefix: productionAssetsUrl, // where we serve assets in production
  useCachebuster: true, // use cachebuster in production
  production: isProduction
});

console.log('You are running in %s mode.',
  (isProduction ? 'production' : 'development').bold);
if (!isProduction)
  console.log('To run in production export %s', "NODE_ENV='production'".bold);
console.log('Assets are rendered like this:');
console.log(assets.jsToHtml('app').grey);
console.log(assets.cssToHtml('lib').grey);
console.log(assets.lessToHtml('app').grey);
console.log(assets.staticUrl('favicon.ico'));
console.log('');

// expose assets to jade templates
app.use(function(req, res, next) {
  res.locals.assets = assets;
  next();
});

// one and only page
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

// compile and deploy assets first
console.log('Deploying assets...');
assets.deploy(function(err) {
  if (err) {
    console.log("Could not deploy assets.".red);
    console.log(err.stack)
    console.error(err);
  } else {
    console.log("Assets deployed! Starting application on port %s.".green, port);
    app.listen(port);
  }
});
