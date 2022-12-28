'use strict';

const { promisify } = require('util');
const requestCallback = require('request');
const request = promisify(requestCallback);
const fs = require('fs');

const config = require('../config');

const getPublicKey = async () => {
  if (!fs.existsSync('public.key')) {
    const { body: publicKey } = await request(`https://${config.domain}/pem`);

    await fs.promises.writeFile('public.key', publicKey, 'utf-8');
    return publicKey;
  }

  const publicKey = await fs.promises.readFile('public.key', 'utf-8');
  return publicKey;
};

module.exports = {
  getPublicKey,
};
