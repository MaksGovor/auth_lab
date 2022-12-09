'use strict';

const httpConstants = require('http-constants');
const fsp = require('fs/promises');
const requestCallback = require('request');
const { promisify } = require('util');

const config = require('./config');
const hourInSec = 60 * 60;
const request = promisify(requestCallback);

const readTokenInfo = async () => {
  try {
    const buffer = await fsp.readFile(config.localTokenPath, 'utf-8');
    const json = JSON.parse(buffer);
    if (json.expiryDate <= Date.now()) {
      return null;
    }

    return json.tokenInfo;
  } catch (err) {
    return null;
  }
};

const storeTokenInfo = async (tokenInfo) => {
  try {
    const tokenValidTimeMsec = (tokenInfo.expires_in - hourInSec) * 1000;
    const buffer = JSON.stringify({
      tokenInfo,
      expiryDate: Date.now() + tokenValidTimeMsec,
    });
    await fsp.writeFile(config.localTokenPath, buffer);
  } catch (err) {
    return null;
  }
};

const getAccessToken = async (tokenOptions) => {
  let tokenInfo = await readTokenInfo();

  if (!tokenInfo) {
    const tokenResponce = await request(tokenOptions);
    if (tokenResponce.statusCode != httpConstants.codes.OK) {
      const { statusCode, statusMessage, body } = tokenResponce;
      console.dir({ statusCode, statusMessage, body });
      return;
    }

    tokenInfo = JSON.parse(tokenResponce.body);
    await storeTokenInfo(tokenInfo);
  }

  return tokenInfo;
};

module.exports = {
  readTokenInfo,
  storeTokenInfo,
  getAccessToken,
};
