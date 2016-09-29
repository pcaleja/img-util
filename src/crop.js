const program = require('commander');
const sharp = require('sharp');
const fs = require('fs');
const del = require('del');

const Crop = {
  outputDirectory: '/_img-util-output',
  directory: '',
  files: '',
  images: '',

  setVariables(dir) {
    Crop.directory = dir ? process.cwd() + dir : process.cwd();
    Crop.files = fs.readdirSync(Crop.directory);
    Crop.images = Crop.files.filter(function(val) {
      if (val.includes('.png') || val.includes('.jpg')) {
        return val;
      }
    });
  },

  setImageParams(image) {
    const imageArray = image.split('.');
    const imageName = imageArray[0];
    const imageExt = `.${imageArray[1]}`;
    const imageOutput = `${Crop.directory + Crop.outputDirectory}/${imageName + imageExt}`
    const imageFile = sharp(`${Crop.directory}/${image}`);

    imageFile
      .metadata()
      .then(function(metadata) {
        return imageFile
          .resize(1538, 1025)
          .crop()
          .toFile(imageOutput)
      })
  },

  loopImages() {
    Crop.images.forEach(function(image) {
      Crop.setImageParams(image)
    });
  },

  init(dir) {
    Crop.setVariables(dir);
    sharp.cache(false);

    fs.readdir(Crop.directory + Crop.outputDirectory, function(err, files) {
      if (err) {
        fs.mkdir(Crop.directory + Crop.outputDirectory, Crop.loopImages());
      } else {
        del([Crop.directory + Crop.outputDirectory + '/*']).then(Crop.loopImages());
      }
    });
  },
}

const crop = {
  exec() {
    program
      .command('crop [dir]')
      .action(Crop.init);
  }
}

module.exports = crop;
