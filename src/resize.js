const program = require('commander');
const sharp = require('sharp');
const fs = require('fs');
const del = require('del');

const Resize = {
  outputDirectory: '/_img-util-output',
  directory: '',
  files: '',
  images: '',
  options: '',

  checkOptions() {
    if (Resize.options.background &&
        Resize.options.divide &&
        Resize.options.width &&
        Resize.options.height) {
      console.error('use only one option');
      return;
    }

    if (typeof Resize.options.background === 'undefined' &&
        typeof Resize.options.divide === 'undefined' &&
        typeof Resize.options.width === 'undefined' &&
        typeof Resize.options.height === 'undefined') {
      console.error('select an option');
      return;
    }
  },

  getImageSize(size, metadata) {
    switch(size) {
      case '100%': return metadata.size;
      case '50%': return metadata.size / 2;
      default: return size;
    }
  },

  setVariables(dir, options) {
    Resize.options = options;
    Resize.directory = dir ? process.cwd() + dir : process.cwd();
    Resize.files = fs.readdirSync(Resize.directory);
    Resize.images = Resize.files.filter(function(val) {
      if (val.includes('.png') || val.includes('.jpg') || val.includes('.jpeg')) {
        return val;
      }
    });
  },

  setImageParams(size, image, suffix) {
    var suffix = suffix || '';
    const imageArray = image.split('.');
    const imageName = imageArray[0];
    const imageSuffix = suffix ? `-${suffix}` : '';
    const imageExt = `.${imageArray[1]}`;
    const imageOutput = `${Resize.directory + Resize.outputDirectory}/${imageName + imageSuffix + imageExt}`
    const imageFile = sharp(`${Resize.directory}/${image}`);

    imageFile
      .metadata()
      .then(function(metadata) {
        const width = Resize.options.width ? Resize.getImageSize(size, metadata) : size;
        const height = Resize.options.height ? Resize.getImageSize(size, metadata) : null;
        return imageFile
          .resize(width, height)
          .toFile(imageOutput);
      })
  },

  formatForBackground(image) {
    Resize.setImageParams(2880, image, '@2x');
    Resize.setImageParams(1984, image, 'sm-@2x');
    Resize.setImageParams(1538, image, 'xs-@2x');
    Resize.setImageParams(960, image, 'xxs-@2x');
    Resize.setImageParams(650, image, 'xxs');
    Resize.setImageParams(769, image, 'xs');
    Resize.setImageParams(992, image, 'sm');
    Resize.setImageParams(1440, image);
  },

  formatForDivide(image) {
    Resize.setImageParams('100%', image, '@2x');
    Resize.setImageParams('50%', image);
  },

  formatForWidth(image) {
    Resize.setImageParams(Number(Resize.options.width), image);
  },

  formatForHeight(image) {
    Resize.setImageParams(Number(Resize.options.height), image);
  },

  formatConditions(image) {
    if (Resize.options.background) Resize.formatForBackground(image);
    if (Resize.options.divide) Resize.formatForDivide(image);
    if (Resize.options.width) Resize.formatForWidth(image);
    if (Resize.options.height) Resize.formatForHeight(image);
  },

  loopImages() {
    Resize.images.forEach(function(image) {
      Resize.formatConditions(image)
    });
  },

  init(dir, options) {
    Resize.setVariables(dir, options);
    Resize.checkOptions();
    sharp.cache(false);

    fs.readdir(Resize.directory + Resize.outputDirectory, function(err, files) {
      if (err) {
        fs.mkdir(Resize.directory + Resize.outputDirectory, Resize.loopImages());
      } else {
        del([Resize.directory + Resize.outputDirectory + '/*']).then(Resize.loopImages());
      }
    });
  },
}

const resize = {
  exec() {
    program
      .command('resize [dir]')
      .option('-b, --background', 'output full width background images')
      .option('-d, --divide','output 1x and 2x images')
      .option('-w, --width [width]', 'output defined width images')
      .option('-h, --height [height]', 'output defined height images')
      .action(Resize.init);
  }
}

module.exports = resize;
