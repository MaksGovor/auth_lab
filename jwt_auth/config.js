'use strict';

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  secretAccessSalt: process.env.SECRET_ACCESS_SALT || 'secret1',
  secretRefreshSalt: process.env.SECRET_REFRESH_SALT || 'secret2',
  sessionKey: 'Authorization',
  expiresInAccess: '10s',
  expiresInRefresh: '1m',
  saltRounds: 10,
};
