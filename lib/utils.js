var sh = require("execSync");

module.exports.gitRevision = function() {
  var result = sh.exec("git rev-parse HEAD");
  console.dir(result);
  if (result.code === 0) {
    return result.stdout.replace('\n', '');
  }
}
