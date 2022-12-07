'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');

const { getAccessToken } = require('./token-local');
const options = require('./request-options');
const request = promisify(requestCallback);

(async () => {
  try {
    const tokenInfo = await getAccessToken(options.tokenOptions);

    const { access_token: accessToken, token_type: tokenType } = tokenInfo;
    const authorizationHeader = `${tokenType} ${accessToken}`;
    const createUserOptions = JSON.parse(JSON.stringify(options.createOptions));
    createUserOptions.headers.Authorization = authorizationHeader;
    console.dir({ authorizationHeader });

    const newUserResponce = await request(createUserOptions);
    if (newUserResponce.statusCode != httpConstants.codes.CREATED) {
      const { statusCode, statusMessage } = newUserResponce;
      console.dir({ statusCode, statusMessage });
      return;
    }

    console.log('User successfully created');
    console.dir(JSON.parse(newUserResponce.body));
  } catch (err) {
    console.log(err);
  }
})();
