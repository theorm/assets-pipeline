var knox = require("knox")
  , mime = require("mime")
  , _ = require("lodash");

var S3 = function(options) {
  this.options = options;
  this.client = knox.createClient(options);
}

S3.prototype._deployBufferOrFile = function(path, bufferOrFile, callback) {
  var contentType = mime.lookup(path);
  var prefix  = this.options.prefix || '';

  var resultCallback = function(err, res) {
    if (err) callback(err, res);
    else if (res.statusCode < 200 || res.statusCode >= 300) {
      callback(new Error('Status: ' + res.statusCode), res);
    } else callback(null, res);
  }

  var fullPath = (prefix + '/' + path).replace(/\/+/g, '/');
  var headers = {'Content-Type': contentType};
  headers = _.extend(headers, this.options.headers);
  console.dir(headers);

  if (Buffer.isBuffer(bufferOrFile)) {
    this.client.putBuffer(bufferOrFile, fullPath, headers, resultCallback);
  } else {
    this.client.putFile(bufferOrFile, fullPath, headers, resultCallback);
  }
}

S3.prototype.deployBuffer = function(path, buffer, callback) {
  return this._deployBufferOrFile(path, buffer, callback);
}

S3.prototype.deployFile = function(path, buffer, callback) {
  return this._deployBufferOrFile(path, buffer, callback);
}

module.exports = S3;