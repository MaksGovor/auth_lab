'use strict';

const httpConstants = require('http-constants');
const uuid = require('uuid');
const requestCallback = require('request');
const { promisify } = require('util');

const config = require('./config');
const { readTokenInfo, storeTokenInfo } = require('./token-local');
const request = promisify(requestCallback);

const tokenOptions = {
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/oauth/token`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    audience: config.audience,
    grant_type: 'client_credentials',
  },
};

const user = {
  email: 'maks.govruha@gmail.com',
  user_metadata: {},
  blocked: false,
  email_verified: false,
  app_metadata: {},
  given_name: 'Maks',
  family_name: 'Govoruha',
  name: 'Maks Govoruha',
  nickname: 'maksgovorrr',
  picture: config.pictureUrl,
  user_id: uuid.v4(),
  connection: 'Username-Password-Authentication',
  password: 'aSBoYXRlIGphdmE=',
  verify_email: false,
};

const createOptions = {
  method: 'POST',
  url: 'https://dev-vip84t2vaeu5hv4b.us.auth0.com/api/v2/users',
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
  },
  body: JSON.stringify(user),
};

(async () => {
  try {
    let tokenInfo = await readTokenInfo();

    if (!tokenInfo) {
      const tokenResponce = await request(tokenOptions);
      if (tokenResponce.statusCode != httpConstants.codes.OK) {
        const { statusCode, statusMessage } = tokenResponce;
        console.dir({ statusCode, statusMessage });
        return;
      }

      tokenInfo = JSON.parse(tokenResponce.body);
      await storeTokenInfo(tokenInfo);
    }

    const { access_token: accessToken, token_type: tokenType } = tokenInfo;
    const authorizationHeader = `${tokenType} ${accessToken}`;
    createOptions.headers.Authorization = authorizationHeader;
    console.dir({ authorizationHeader });

    const newUserResponce = await request(createOptions);
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
