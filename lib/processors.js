var uglifyjs = require("uglify-js")
  , _ = require("lodash")
  , path = require("path")
  , Promise = require("bluebird")
  , fs = Promise.promisifyAll(require("fs"))
  , CleanCSS = require("clean-css")
  , less = require("less");

module.exports.minifyJS = function(baseDirectory, files, callback) {
  try {
    var result = uglifyjs.minify(_.map(files, function(f) {
      return path.join(baseDirectory, f);
    }));
    callback(null, new Buffer(result.code));
  } catch(e) {
    callback(e);
  }
}

module.exports.minifyCSS = function(baseDirectory, files, callback) {
  var cc = new CleanCSS({keepBreaks: true});
  var cleanCSS = Promise.promisify(cc.minify, cc);

  var buffers = [];
  var errorReported = false;

  if (!files.length) return callback(null, new Buffer(""));

  _.each(files, function(f) {
    var filePath = path.join(baseDirectory, f);

    fs.readFileAsync(filePath).then(function(contents) {
      return cleanCSS(contents);
    }).then(function(minifiedCSS) {
      buffers.push(new Buffer(minifiedCSS));

      if (buffers.length == files.length) {
        var buffer = _.reduce(buffers, function(accumulator, b) {
          return Buffer.concat([accumulator, b]);
        }, new Buffer(""));

        callback(null, buffer);
      }
    }).catch(function(e) {
      if (!errorReported) {
        callback(e);
        errorReported = true;
      }
    });

  }, this);
}

module.exports.minifyLess = function(baseDirectory, files, callback) {
  var buffers = [];
  var errorReported = false;


  if (!files.length) return callback(null, new Buffer(""));

  _.each(files, function(f) {
    var filePath = path.join(baseDirectory, f);

    fs.readFileAsync(filePath).then(function(contents) {
      var lessParser = new less.Parser({
        paths: [path.dirname(filePath)],
      });
      var parseLess = Promise.promisify(lessParser.parse, lessParser);

      return parseLess(contents.toString());
    }).then(function(lessTree) {
      buffers.push(new Buffer(lessTree.toCSS({compress: true})));

      if (buffers.length == files.length) {
        var buffer = _.reduce(buffers, function(accumulator, b) {
          return Buffer.concat([accumulator, b]);
        }, new Buffer(""));

        callback(null, buffer);
      }
    }).catch(function(e) {
      if (!errorReported) {
        callback(e);
        errorReported = true;
      }
    });
  }, this);
}