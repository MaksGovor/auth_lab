'use strict';

const httpConstants = require('http-constants');

class ApiError extends Error {
  constructor(message, statusCode = httpConstants.codes.BAD_REQUEST, data) {
    super(message || this.constructor.name);
    this.statusCode = statusCode;
    this.data = data;
  }
}

module.exports = ApiError;
