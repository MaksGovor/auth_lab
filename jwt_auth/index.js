'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const { port, sessionKey } = require('./config');
const tokenManager = require('./token-manager');
const AttemptManager = require('./attempt-manager');
const DataBase = require('./db/Database');
const { generateUserDto } = require('./users-dto');
const logger = require('./logger');

const attempsManager = new AttemptManager();
const app = express();
const users = DataBase.parseJsonDB(path.join(__dirname + '/db/users.json'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_KEY = sessionKey;

app.use((req, res, next) => {
  try {
    const authorizationHeader = req.get(SESSION_KEY);
    const accessToken = authorizationHeader.split(' ')[1];
    const payload = tokenManager.getPayloadAccessToken(accessToken);
    if (payload) {
      req.user = generateUserDto(payload);
      logger.info(`${req.user.username} get by Access Token`);
    } else {
      logger.error('Unathorized');
    }
  } catch {}

  next();
});

app.get('/insystem', (req, res) => {
  if (req.user && req.user.username) {
    return res.status(200).send();
  }
  res.status(401).send();
});

app.get('/', (req, res) => {
  if (req.user && req.user.username) {
    return res.json({
      username: req.user.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
  const { refreshToken } = req.cookies;

  const payload = tokenManager.getPayloadRefreshToken(refreshToken);
  logger.info(`${payload ? payload.username : 'user'} logout`);
  tokenManager.deleteToken(refreshToken);
  res.clearCookie('refreshToken');
  res.redirect('/');
});

app.get('/api/refresh', (req, res) => {
  const { refreshToken } = req.cookies;

  const payload = tokenManager.checkRefreshTokenValid(refreshToken);
  if (refreshToken && payload) {
    const userDto = generateUserDto(payload);
    const tokens = tokenManager.generatePairOfTokens(userDto);
    tokenManager.storeToken(userDto.login, tokens.resreshToken);

    logger.info(`Refresh token for ${userDto.username}`);
    res.cookie('refreshToken', tokens.resreshToken, { httpOnly: true });
    res.json({ token: tokens.accessToken });
  }

  res.status(401).send();
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  if (!attempsManager.canLogin(login)) {
    return res.status(401).json({ waitTime: attempsManager.waitTime });
  }

  const user = users.find(
    (user) =>
      user.login === login && bcrypt.compareSync(password, user.password)
  );

  if (user) {
    attempsManager.sucseccLogin(login);
    const userDto = generateUserDto(user);
    const tokens = tokenManager.generatePairOfTokens(userDto);
    tokenManager.storeToken(login, tokens.resreshToken);

    logger.info(`${userDto.username} successfully login`);
    res.cookie('refreshToken', tokens.resreshToken, { httpOnly: true });
    res.json({ token: tokens.accessToken });
  }

  attempsManager.addAttempt(login);
  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
