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

const createUser = async (userInput) => {
  const { access_token, token_type } = await appToken.getAppAccessToken();
  const authorizationHeader = `${token_type} ${access_token}`;

  const { name, surname, nickname, login, password } = userInput;
  const user = options.getUser(name, surname, nickname, login, password);
  const isValidUser = Object.keys(user).reduce(
    (acc, key) => acc && user[key] !== undefined,
    true
  );
  if (!isValidUser) {
    throw new ApiError(
      `Not all fields of registration: ${statusMessage} ${body}`
    );
  }

  const createUserOptions = options.getUserCreateOptions(
    authorizationHeader,
    user
  );

  const newUserResponce = await request(createUserOptions);
  if (newUserResponce.statusCode != httpConstants.codes.CREATED) {
    const { statusCode, statusMessage, body } = newUserResponce;
    throw new ApiError(
      `Auth0 user-creation: ${statusCode} ${statusMessage} ${body}`
    );
  }
};

module.exports = {
  getUserById,
  createUser,
};
