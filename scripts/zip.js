const fs = require('fs');
const path = require('path');
const zipFolder = require('zip-folder');

const manifestJson = require('../build/manifest.json');

const SrcFolder = path.join(__dirname, '../build');
const ZipFilePath = path.join(__dirname, '../release');

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(ZipFilePath)) {
    fs.mkdirSync(ZipFilePath);
  }
};

function removeSpace(str, str2) {
  return str?.replace(/\s+/g, str2 || '');
}

const main = () => {
  const { name, version } = manifestJson;
  const zipFilename = path.join(
    ZipFilePath,
    `${removeSpace(name, '_')}-v${removeSpace(version)}.zip`
  );

  makeDestZipDirIfNotExists();

  console.info(`Zipping ${zipFilename}...`);
  zipFolder(SrcFolder, zipFilename, (err) => {
    if (err) {
      return console.err(err);
    }
    console.info('Zip is OK');
  });
};

main();
