#!/usr/bin/env node

/*
  img-util resize [directory] [options: --background, --half]
  img-util crop [directory] [options: --width, --height]
  img-util optimize [directory]
*/

var program = require('commander');
var resize = require('./src/resize');
var crop = require('./src/crop');

resize.exec();
crop.exec();

program
  .version('0.0.1')
  .parse(process.argv);
