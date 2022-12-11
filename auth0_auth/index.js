'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const httpConstants = require('http-constants');

const { port, sessionKey } = require('./config');
const appToken = require('./auth0-utils/app-token');
const userToken = require('./auth0-utils/user-token');
const userModel = require('./auth0-utils/user-crud');
const AttemptManager = require('./attempt-manager');
const DataBase = require('./db/Database');
const ApiError = require('./error/apiError');

const attempsManager = new AttemptManager();
const tokensStorage = new DataBase(path.join(__dirname + '/db/tokens.json'));
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = sessionKey;

app.use((req, res, next) => {
  try {
    const authorizationHeader = req.get(SESSION_KEY);
    const accessToken = authorizationHeader.split(' ')[1];
    const payload = userToken.getPayloadFromToken(accessToken);
    if (payload) {
      req.userId = payload.sub;
      logger.info(`User with id ${req.userId} authorized by Access Token`);
    } else {
      logger.error('Unathorized');
    }
  } catch {}

  next();
});

app.get('/', async (req, res) => {
  if (req.userId) {
    const userData = await userModel.getUserById(req.userId);

    return res.json({
      username: `${userData.name}(${userData.email})`,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(httpConstants.codes.UNAUTHORIZED).send();
  }

  await tokensStorage.deleteByKey(userId);
  res.redirect('/');
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  if (!attempsManager.canLogin(login))
    res
      .status(httpConstants.codes.UNAUTHORIZED)
      .json({ waitTime: attempsManager.waitTime });

  try {
    const { accessToken, refreshToken } = await userToken.getUserAccessToken(
      login,
      password
    );

    const { sub: userId } = userToken.getPayloadFromToken(accessToken);
    tokensStorage.upsert(userId, { refreshToken });

    console.log(`${login} successfully login`);
    res.json({ token: accessToken });
  } catch (err) {
    if (err instanceof ApiError) {
      attempsManager.addAttempt(login);
      return res.status(err.statusCode).send(err.message);
    }

    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.post('/api/register', (req, res) => {
  res.send('aa');
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);

  const appAccessToken = await appToken.getAppAccessToken();

  console.log({ appAccessToken });
});
