'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const httpConstants = require('http-constants');
const { expressjwt: expressJwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const config = require('./config');
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
app.use(cookieParser());

const SESSION_KEY = config.sessionKey;

const checkJwt = expressJwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.domain}/.well-known/jwks.json`
  }),

  audience: config.audience,
  issuer: `https://${config.domain}/`,
  algorithms: [ 'RS256' ]
});

app.use(async (req, res, next) => {
  try {
    const authorizationHeader = req.get(SESSION_KEY);
    const accessToken = authorizationHeader.split(' ')[1];
    const payload = userToken.getPayloadFromToken(accessToken);
    if (payload && payload.exp < Date.now()) {
      req.userId = payload.sub;
      console.log(`User with id ${req.userId} authorized by Access Token`);
    } else {
      console.log('Not valid authorization header');
    }
  } catch {}

  next();
});

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/userinfo', checkJwt, async (req, res) => {
  if (req.userId) {
    const userData = await userModel.getUserById(req.userId);

    return res.json({
      username: `${userData.name}(${userData.email})`,
      logout: 'http://localhost:3000/logout',
    });
  }
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/logout', checkJwt, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(httpConstants.codes.UNAUTHORIZED).send();
    }

    console.log(`User with id ${userId} successfully logout`);
    await tokensStorage.deleteByKey(userId);
    res.clearCookie('refreshToken');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  if (!attempsManager.canLogin(login))
    return res
      .status(httpConstants.codes.UNAUTHORIZED)
      .json({ waitTime: attempsManager.waitTime });

  try {
    const { accessToken, expiresIn, refreshToken } =
      await userToken.getUserAccessToken(login, password);

    const { sub: userId } = userToken.getPayloadFromToken(accessToken);
    tokensStorage.upsert(userId, { refreshToken });

    console.log(`User with id ${userId} (${login}) successfully login`);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({
      token: accessToken,
      expiresDate: Date.now() + expiresIn * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      attempsManager.addAttempt(login);
      return res.status(err.statusCode).send(err.message);
    }

    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.get('/api/refresh', checkJwt, async (req, res) => {
  try {
    const userId = req.userId;
    const { refreshToken } = req.cookies;

    if (!userId) return res.status(httpConstants.codes.UNAUTHORIZED).send();

    const { refreshToken: refreshTokenDb } = tokensStorage.getData(userId);
    if (refreshToken === refreshTokenDb) {
      const { accessToken, expiresIn } = await userToken.refreshUserToken(
        refreshToken
      );
      console.log(`Refresh token for user with id ${req.userId}`);
      res.json({
        token: accessToken,
        expiresDate: Date.now() + expiresIn * 1000,
      });
    }

    res.status(httpConstants.codes.UNAUTHORIZED).send();
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).send(err.message);
    }

    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const userOptions = req.body;
    const user = await userModel.createUser(userOptions);

    console.log(
      `User with id ${user.user_id} (${user.email}) successfully registered`
    );
    res.json({ redirect: '/' });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).send(err.message);
    }

    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.listen(config.port, async () => {
  console.log(`Example app listening on port ${config.port}`);

  const appAccessToken = await appToken.getAppAccessToken();

  console.log({ appAccessToken });
});
