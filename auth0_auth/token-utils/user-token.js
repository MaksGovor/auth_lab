'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');

const options = require('./request-options');
const ApiError = require('../error/apiError');
const request = promisify(requestCallback);

const getUserAccessToken = async (username, password) => {
  const userTokenOptions = options.getUserTokenOptions(username, password);

  const accessTokenUserResponce = await request(userTokenOptions);
  if (accessTokenUserResponce.statusCode != httpConstants.codes.OK) {
    const { statusCode, statusMessage, body } = accessTokenUserResponce;
    throw new ApiError(
      `Auth0 user-token: ${statusCode} ${statusMessage} ${body}`
    );
  }

  const responce = JSON.parse(accessTokenUserResponce.body);

  return {
    accessToken: responce.access_token,
    refreshToken: responce.refresh_token,
  };
};

module.exports = {
  getUserAccessToken,
};
