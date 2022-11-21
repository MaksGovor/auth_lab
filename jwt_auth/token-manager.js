'use strict';

const jwt = require('jsonwebtoken');
const path = require('path');

const config = require('./config');
const Database = require('./db/Database');
const tokensStorage = new Database(path.join(__dirname + '/db/tokens.json'));

const {
  secretAccessSalt,
  secretRefreshSalt,
  expiresInAccess,
  expiresInRefresh,
} = config;

const generatePairOfTokens = (payload) => {
  const accessToken = jwt.sign(payload, secretAccessSalt, {
    expiresIn: expiresInAccess,
  });

  const resreshToken = jwt.sign(payload, secretRefreshSalt, {
    expiresIn: expiresInRefresh,
  });

  return {
    accessToken,
    resreshToken,
  };
};

const storeToken = (login, resreshToken) => {
  tokensStorage.upsert(login, { resreshToken });
};

const deleteToken = (resreshToken) => {
  tokensStorage.deleteByFind((data) => data.resreshToken === resreshToken);
};

const getPayloadAccessToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, config.secretAccessSalt);
  } catch (error) {
    return null;
  }
};

const getPayloadRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, config.secretRefreshSalt);
  } catch (error) {
    return null;
  }
};

const checkRefreshTokenValid = (refreshToken) => {
  const payload = getPayloadRefreshToken(refreshToken);
  const dbToken = tokensStorage.find(
    (data) => data.resreshToken === refreshToken
  );
  return payload && dbToken ? payload : null;
};

module.exports = {
  generatePairOfTokens,
  storeToken,
  deleteToken,
  checkRefreshTokenValid,
  getPayloadAccessToken,
  getPayloadRefreshToken,
};
