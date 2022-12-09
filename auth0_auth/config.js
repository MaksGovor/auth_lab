'use strict';

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  sessionKey: 'Authorization',
  domain: process.env.DOMAIN || '',
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  audience: process.env.AUDIENCE || '',
  pictureUrl:
    'https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png',
  localTokenPath: `${__dirname}/token-info.json`,
};
