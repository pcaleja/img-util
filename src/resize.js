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
        Resize.options.half &&
        Resize.options.width) {
      console.error('use only one option');
      return;
    }

    if (typeof Resize.options.background === 'undefined' &&
        typeof Resize.options.half === 'undefined' &&
        typeof Resize.options.width === 'undefined') {
      console.error('select an option');
      return;
    }
  },

  getImageWidth(width, metadata) {
    switch(width) {
      case '100%': return metadata.width;
      case '50%': return metadata.width / 2;
      default: return width;
    }
  },

  setVariables(dir, options) {
    Resize.options = options;
    Resize.directory = dir ? process.cwd() + dir : process.cwd();
    Resize.files = fs.readdirSync(Resize.directory);
    Resize.images = Resize.files.filter(function(val) {
      if (val.includes('.png') || val.includes('.jpg')) {
        return val;
      }
    });
  },

  setImageParams(width, image, suffix) {
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
        return imageFile
          .resize(Resize.getImageWidth(width, metadata))
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

  formatForHalf(image) {
    Resize.setImageParams('100%', image, '@2x');
    Resize.setImageParams('50%', image);
  },

  formatForWidth(image) {
    Resize.setImageParams(Number(Resize.options.width), image);
  },

  formatConditions(image) {
    if (Resize.options.background) Resize.formatForBackground(image);
    if (Resize.options.half) Resize.formatForHalf(image);
    if (Resize.options.width) Resize.formatForWidth(image);
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
      .option('-h, --half','output 1x and 2x images')
      .option('-w, --width [width]', 'output defined width images')
      .action(Resize.init);
  }
}

module.exports = resize;
