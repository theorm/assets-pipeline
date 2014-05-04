var _ = require("lodash")
  , processors = require("./processors")
  , path = require("path")
  , Promise = require("bluebird")
  , deployers = require("./deployers")
  , fmt = require("util").format
  , utils = require("./utils")
  , readdirRecursive = Promise.promisify(require("recursive-readdir"));

var SCRIPT_TAG = "<script src=\"%s/%s\"></script>";
var CSS_TAG = "<link rel=\"stylesheet\" href=\"%s/%s\" />";
var LESS_TAG = "<link rel=\"stylesheet/less\" type=\"text/css\" href=\"%s/%s\" />"
var LESS_LIBRARY_TAG = "<script src=\"//cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min.js\"></script>"

var minifyJS = Promise.promisify(processors.minifyJS);
var minifyCSS = Promise.promisify(processors.minifyCSS);
var minifyLess = Promise.promisify(processors.minifyLess);

var defaultCachebuster = utils.gitRevision() || (new Date()).getTime();


var defaultOptions = {
  localPrefix: "/assets",
  production: false,
  assetsDirectory: process.cwd(),
  js: {},
  less: {},
  css: {},
  statics: [],
  useCachebuster: false,
  deployment: {}
}

var Assets = function(options) {
  this.options = _.extend(defaultOptions, options);
  if (this.options.useCachebuster) {
    var cachebuster = this.options.cachebuster;
    if (!cachebuster) {
      cachebuster = defaultCachebuster;
    }
    this.cachebuster = cachebuster;
  }
}

Assets.prototype.getDeployedJSFileName = function(name) {
  return fmt("js/%s%s.js", name, this.cachebuster ? "-" + this.cachebuster : "");
}

Assets.prototype.getDeployedCSSFileName = function(name) {
  return fmt("css/%s%s.css", name, this.cachebuster ? "-" + this.cachebuster : "");
}

Assets.prototype.jsToHtml = function(name) {
  if (this.options.production) {
    var f = this.getDeployedJSFileName(name);
    return fmt(SCRIPT_TAG, this.options.productionPrefix, f);
  } else {
    var files = this.options.js[name] || [];
    return _.map(files, function(f) {
      return fmt(SCRIPT_TAG, this.options.localPrefix, f);
    }, this).join("\n");
  }
}

Assets.prototype.cssToHtml = function(name) {
  if (this.options.production) {
    var f = this.getDeployedCSSFileName(name);
    return fmt(CSS_TAG, this.options.productionPrefix, f);
  } else {
    var files = this.options.css[name] || [];
    return _.map(files, function(f) {
      return fmt(CSS_TAG, this.options.localPrefix, f);
    }, this).join("\n");
  }
}

Assets.prototype.lessToHtml = function(name) {
  if (this.options.production) {
    var f = this.getDeployedCSSFileName(name);
    return fmt(CSS_TAG, this.options.productionPrefix, f);
  } else {
    var files = this.options.less[name] || [];
    tags = _.map(files, function(f) {
      return fmt(LESS_TAG, this.options.localPrefix, f);
    }, this);
    tags.push(LESS_LIBRARY_TAG)
    return tags.join("\n");
  }
}

Assets.prototype._deployStatic = function(deployer) {
  var deploy = Promise.promisify(deployer.deployFile, deployer);

  return Promise.all(_.map(this.options.statics, function(p) {
    p = path.join(this.options.assetsDirectory, p);

    return readdirRecursive(p)
      .then(function(files) {
        return files;
      })
      .catch(function(e) {
        if (e.cause.code === 'ENOTDIR') return [p];
        else return [];
      })
  }, this)).bind(this)
  .then(function(paths) {
    var files = _.union.apply(_, paths);

    var promise = Promise.resolve().bind(this);

    _.each(files, function(f) {
      promise = promise.then(function() {
        return deploy(f.replace(this.options.assetsDirectory, '') ,f);
      }).then(function() {
        // console.log(f + ' deployed')
      })
    }, this);

    return promise;
  });
}

Assets.prototype.deploy = function(callback) {
  var deployer = deployers.get(this.options.deployment);

  if (!deployer) return callback(
    new Error("No deployment configured or configuration is invalid.")
  );

  var deploy = Promise.promisify(deployer.deployBuffer, deployer);

  var processJS = Promise.all(
    _.map(_.keys(this.options.js), function(name) {
      var files = this.options.js[name] || [];
      return minifyJS(this.options.assetsDirectory, files).bind(this)
        .then(function(buf) {
          return deploy(this.getDeployedJSFileName(name), buf);
        });
  }, this));

  var processCSS = Promise.all(
    _.map(_.keys(this.options.css), function(name) {
      var files = this.options.css[name] || [];
      return minifyCSS(this.options.assetsDirectory, files).bind(this)
        .then(function(buf) {
          return deploy(this.getDeployedCSSFileName(name), buf);
        });
  }, this));

  var processLess = Promise.all(
    _.map(_.keys(this.options.less), function(name) {
      var files = this.options.less[name] || [];
      return minifyLess(this.options.assetsDirectory, files).bind(this)
        .then(function(buf) {
          return deploy(this.getDeployedCSSFileName(name), buf);
        });
  }, this));

  var processStatic = this._deployStatic(deployer);

  Promise.all([
    processJS,
    processCSS,
    processLess,
    processStatic
  ]).then(function() {
    callback ? callback() : _.noop();
  }).catch(function(e) {
    callback ? callback(e) : _.noop();
  });
}

module.exports.Assets = Assets;

