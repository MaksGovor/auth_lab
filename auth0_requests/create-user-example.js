'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');

const { getAccessToken } = require('./token-local');
const options = require('./request-options');
const request = promisify(requestCallback);

(async () => {
  try {
    const tokenOptions = options.getTokenOptions();
    const tokenInfo = await getAccessToken(tokenOptions);

    const { access_token: accessToken, token_type: tokenType } = tokenInfo;
    const authorizationHeader = `${tokenType} ${accessToken}`;
    const createUserOptions = options.getUserCreateOptions(authorizationHeader);
    console.dir({ authorizationHeader });

    const newUserResponce = await request(createUserOptions);
    if (newUserResponce.statusCode != httpConstants.codes.CREATED) {
      const { statusCode, statusMessage, body } = newUserResponce;
      console.dir({ statusCode, statusMessage, body });
      return;
    }

    console.log('User successfully created');
    console.dir(JSON.parse(newUserResponce.body));
  } catch (err) {
    console.log(err);
  }
})();
