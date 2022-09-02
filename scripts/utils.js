const fs = require('fs-extra');
const paths = require('../config/paths');

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}


module.exports = {
  copyPublicFolder,
};
