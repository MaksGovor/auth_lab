'use strict';

const httpConstants = require('http-constants');
const uuid = require('uuid');
const config = require('../config');

const getAppTokenOptions = () => ({
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

const getUserTokenOptions = (username, password) => ({
  method: httpConstants.methods.POST,
  url: `https://${config.domain}/oauth/token`,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
    grant_type: 'password',
    audience: config.audience,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'offline_access',
    username: username || defaultUser.email,
    password: password || defaultUser.password,
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

const userEmailPasswordChange = 'maks.govruha@gmail.com';
const newPassword = 'hello=world_newPassWORD';

const getChangePasswordOptions = (authorization, userId, password) => ({
  method: httpConstants.methods.PATCH,
  url: `https://${config.domain}/api/v2/users/${userId}`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: authorization,
  },
  body: JSON.stringify({
    password: password || newPassword,
    connection: 'Username-Password-Authentication',
  }),
});

const getUserListOptions = (authorization) => ({
  method: httpConstants.methods.GET,
  url: `https://${config.domain}/api/v2/users`,
  headers: {
    Authorization: authorization,
  },
});

module.exports = {
  userEmailPasswordChange,
  newPassword,

  getAppTokenOptions,
  getUserCreateOptions,
  getUserTokenOptions,
  getRefreshUserTokenOptions,
  getChangePasswordOptions,
  getUserListOptions,
};
