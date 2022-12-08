'use strict';

const httpConstants = require('http-constants');
const requestCallback = require('request');
const { promisify } = require('util');

const request = promisify(requestCallback);
const { getAccessToken } = require('./token-local');
const options = require('./request-options');

(async () => {
  try {
    const tokenOptions = options.getTokenOptions();
    const tokenInfo = await getAccessToken(tokenOptions);

    const { access_token: accessToken, token_type: tokenType } = tokenInfo;
    const authorizationHeader = `${tokenType} ${accessToken}`;
    const userListOptions = options.getUserListOptions(authorizationHeader);

    const userListResponce = await request(userListOptions);
    if (userListResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = userListResponce;
      console.dir({ statusCode, statusMessage, body });
      return;
    }

    const users = JSON.parse(userListResponce.body);
    const user = users.find(
      (user) => user.email === options.userEmailPasswordChange
    );
    if (!user) {
      console.log(
        `Can't find user with email ${options.userEmailPasswordChange}`
      );
    }

    const changePasswordOptions = options.getChangePasswordOptions(
      authorizationHeader,
      user.user_id,
      options.newPassword
    );

    console.log('Change password options:');
    console.dir(changePasswordOptions);

    const changePasswordResponce = await request(changePasswordOptions);
    if (changePasswordResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = changePasswordResponce;
      console.dir({ statusCode, statusMessage, body });
      return;
    }

    console.log('Password changed');

    console.log('Try get access token with new password:');

    const userTokenOptions = options.getUserTokenOptions(
      options.userEmailPasswordChange,
      options.newPassword
    );
    const userTokenResponce = await request(userTokenOptions);

    if (userTokenResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = userTokenResponce;
      console.dir({ statusCode, statusMessage, body });
      console.log(userTokenResponce.body);
      return;
    }

    console.dir(JSON.parse(userTokenResponce.body));
  } catch (err) {
    console.log(err);
  }
})();
