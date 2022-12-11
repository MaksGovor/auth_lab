'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

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
    expiresIn: responce.expires_in,
    refreshToken: responce.refresh_token,
  };
};

const refreshUserToken = async (refreshToken) => {
  const refreshTokenOptions = options.getRefreshUserTokenOptions(refreshToken);

  const refreshTokenResponce = await request(refreshTokenOptions);
  if (refreshTokenResponce.statusCode != httpConstants.codes.OK) {
    const { statusCode, statusMessage, body } = refreshTokenResponce;
    throw new ApiError(
      `Auth0 user-token: ${statusCode} ${statusMessage} ${body}`
    );
  }

  const responce = JSON.parse(accessTokenUserResponce.body);
  return {
    accessToken: responce.access_token,
    expiresIn: responce.expires_in,
  };
};

const getPayloadFromToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  getUserAccessToken,
  getPayloadFromToken,
  refreshUserToken,
};
