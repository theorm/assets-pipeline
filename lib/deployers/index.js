module.exports.get = function(options) {
  if (!options || !options.method) return;
  try {
    var deployer = require("./" + options.method);
  } catch (e) {
    return;
  }

  return new deployer(options);
}