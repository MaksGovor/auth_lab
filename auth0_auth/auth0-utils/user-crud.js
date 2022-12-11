'use strict';

const requestCallback = require('request');
const { promisify } = require('util');
const httpConstants = require('http-constants');

const options = require('./request-options');
const appToken = require('./app-token');
const ApiError = require('../error/apiError');
const request = promisify(requestCallback);

const getUserById = async (userId) => {
  const { access_token, token_type } = await appToken.getAppAccessToken();
  const authorizationHeader = `${token_type} ${access_token}`;
  const userGetOptions = options.getUserGetOptions(authorizationHeader, userId);

  const userResponce = await request(userGetOptions);
  if (userResponce.statusCode != httpConstants.codes.OK) {
    const { statusCode, statusMessage, body } = userResponce;
    throw new ApiError(
      `Auth0 user-token: ${statusCode} ${statusMessage} ${body}`
    );
  }

  const responce = JSON.parse(userResponce.body);

  return responce;
};

module.exports = {
  getUserById,
};
