'use strict';

const config = require('../config');
const { getPublicKey } = require('./public-key');
const jwt = require('jsonwebtoken');

const verifyOptions = {
  issuer: `https://${config.domain}/`,
  audience: config.audience,
  algorithms: ['RS256'],
};

const verifyToken = async (accessToken) => {
  try {
    const publicKey = config.publicKey || (await getPublicKey());
    config.publicKey = publicKey;

    const payload = jwt.verify(accessToken, publicKey, verifyOptions);

    return payload;
  } catch (err) {
    console.log({ jwtVerifyErrorMsg: err.message })
    return null;
  }
};

module.exports = {
  verifyToken,
};
