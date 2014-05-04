var Client = require('scp2').Client
  , Path = require("path");

var Scp = function(options) {
  this.options = options;
}

Scp.prototype._deployBufferOrFile = function(path, bufferOrFile, callback) {
  var client = new Client(this.options);
  var cb = function(err) {
    client.close();
    return callback(err);
  }

  var fullPath = Path.join(this.options.prefix, path);

  if (Buffer.isBuffer(bufferOrFile)) {
    client.mkdir(Path.dirname(fullPath), function(err) {

      client.write({
        destination: fullPath,
        content: bufferOrFile
      }, cb);
    });
  } else {
    client.upload(bufferOrFile, fullPath, cb);
  }
}

Scp.prototype.deployBuffer = function(path, buffer, callback) {
  return this._deployBufferOrFile(path, buffer, callback);
}

Scp.prototype.deployFile = function(path, file, callback) {
  return this._deployBufferOrFile(path, file, callback);
}

module.exports = Scp;
