var path = require("path")
  , fs = require("fs")
  , mkdirp = require('mkdirp');


var Cp = function(options) {
  this.options = options;
}

Cp.prototype.deploy = function(filename, buffer, callback) {
  var location = this.options.location;
  var dirname = path.dirname(path.join(location, filename));

  mkdirp(dirname, function(err) {
    if (err) return callback(err);
    fs.writeFile(path.join(location, filename), buffer, callback);
  });
}

module.exports = Cp;