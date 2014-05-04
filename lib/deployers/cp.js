var path = require("path")
  , fs = require("fs")
  , mkdirp = require('mkdirp')
  , ncp = require("ncp");


var Cp = function(options) {
  this.options = options;
}

Cp.prototype.deployBuffer = function(filename, buffer, callback) {
  var location = this.options.prefix;
  var dirname = path.dirname(path.join(location, filename));

  mkdirp(dirname, function(err) {
    if (err) return callback(err);
    fs.writeFile(path.join(location, filename), buffer, callback);
  });
}

Cp.prototype.deployFile = function(filename, localFilePath, callback) {
  var location = this.options.prefix;
  var dirname = path.dirname(path.join(location, filename));

  mkdirp(dirname, function(err) {
    if (err) return callback(err);
    ncp(localFilePath, path.join(location, filename), callback);
  });
}

module.exports = Cp;