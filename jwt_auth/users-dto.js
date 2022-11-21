'use strict';

const generateUserDto = (user) => ({
  login: user.login,
  username: user.username,
});

module.exports = {
  generateUserDto,
};
