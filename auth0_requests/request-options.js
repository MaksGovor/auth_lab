'use strict';

const httpConstants = require('http-constants');
const uuid = require('uuid');
const config = require('./config');

// Lab 2

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

const createOptions = {
  method: 'POST',
  url: `https://${config.domain}/api/v2/users`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
  },
  body: JSON.stringify(user),
};

module.exports = {
  tokenOptions,
  createOptions,
};
