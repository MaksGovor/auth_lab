'use strict';

const requestCallback = require('request');
const { promisify } = require('util');
const httpConstants = require('http-constants');

const options = require('./request-options');
const ApiError = require('../error/apiError');
const request = promisify(requestCallback);

const authByCode = async (code) => {
  const codeAuthOptions = options.getCodeOptions(code);

  const tokenResponce = await request(codeAuthOptions);
  if (tokenResponce.statusCode != httpConstants.codes.OK) {
    const { statusCode, statusMessage, body } = tokenResponce;
    throw new ApiError(
      `Auth0 user-token: ${statusCode} ${statusMessage} ${body}`
    );
  }

  const responce = JSON.parse(tokenResponce.body);

  return {
    accessToken: responce.access_token,
    expiresIn: responce.expires_in,
    refreshToken: responce.refresh_token,
  };
};

module.exports = {
  authByCode,
};
