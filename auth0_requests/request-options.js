'use strict';

const httpConstants = require('http-constants');
const uuid = require('uuid');
const config = require('./config');

// Lab 2

const getTokenOptions = () => ({
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/oauth/token`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    audience: config.audience,
    grant_type: 'client_credentials',
  },
});

const defaultUser = {
  email: 'maksgovruha@gmail.com',
  user_metadata: {},
  blocked: false,
  email_verified: false,
  app_metadata: {},
  given_name: 'Maks',
  family_name: 'Govoruha',
  name: 'Max Govoruha',
  nickname: 'maksgovorrr',
  picture: config.pictureUrl,
  user_id: uuid.v4(),
  connection: 'Username-Password-Authentication',
  password: 'aSBoYXRlIGphdmE=',
  verify_email: false,
};

const getUserCreateOptions = (authorization, user = defaultUser) => ({
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/api/v2/users`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: authorization,
  },
  body: JSON.stringify(user),
});

// Lab 3

const getUserTokenOptions = () => ({
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/oauth/token`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
    grant_type: 'password',
    audience: config.audience,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'offline_access',
    username: defaultUser.email,
    password: defaultUser.password,
  },
});

const getRefreshUserTokenOptions = (refreshToken) => ({
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/oauth/token`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  },
});

module.exports = {
  getTokenOptions,
  getUserCreateOptions,
  getUserTokenOptions,
  getRefreshUserTokenOptions,
};
