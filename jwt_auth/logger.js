'use strict';

const bunyan = require('bunyan');
const path = require('path');

const logger = bunyan.createLogger({
  name: 'ExampleJWT',
  streams: [
    {
      level: 'error',
      path: path.join(__dirname + '/myapp-error.log'),
    },
    {
      level: 'info',
      stream: process.stdout,
    },
  ],
});

module.exports = logger;
