#!/usr/bin/env node

const rimraf   	= require('rimraf');
const paths   	= require('./paths.js');

rimraf.sync(paths.build);
