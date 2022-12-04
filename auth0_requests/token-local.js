'use strict';

const fsp = require('fs/promises');
const config = require('./config');
const hourInSec = 60 * 60;

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

module.exports = {
  readTokenInfo,
  storeTokenInfo,
};
