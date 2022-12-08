'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');

const request = promisify(requestCallback);
const options = require('./request-options');

(async () => {
  try {
    const userTokenOptions = options.getUserTokenOptions();

    const accessTokenUserResponce = await request(userTokenOptions);
    if (accessTokenUserResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = accessTokenUserResponce;
      console.dir({ statusCode, statusMessage, body });
      console.log(accessTokenUserResponce.body);
      return;
    }

    const userTokenResponceBody = JSON.parse(accessTokenUserResponce.body);
    console.log('User access token responce:');
    console.dir(userTokenResponceBody);

    const refreshTokenOptions = options.getRefreshUserTokenOptions(
      userTokenResponceBody.refresh_token
    );

    const refreshTokenResponce = await request(refreshTokenOptions);
    if (refreshTokenResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = refreshTokenResponce;
      console.dir({ statusCode, statusMessage, body });
      console.log(refreshTokenResponce.body);
      return;
    }

    console.log('Refreshed user token:');
    console.dir(JSON.parse(refreshTokenResponce.body));
  } catch (err) {
    console.log(err);
  }
})();
