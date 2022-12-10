'use strict';

const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const httpConstants = require('http-constants');

const { port, sessionKey } = require('./config');
const appToken = require('./token-utils/app-token');
const userToken = require('./token-utils/user-token');
const AttemptManager = require('./attempt-manager');
const DataBase = require('./db/Database');
const ApiError = require('./error/apiError');

const attempsManager = new AttemptManager();
const tokensStorage = new DataBase(path.join(__dirname + '/db/tokens.json'));
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = sessionKey;

class Session {
  #sessions = {};

  constructor() {
    try {
      this.#sessions = fs.readFileSync('./sessions.json', 'utf8');
      this.#sessions = JSON.parse(this.#sessions.trim());

      console.log(this.#sessions);
    } catch (e) {
      this.#sessions = {};
    }
  }

  #storeSessions() {
    fs.writeFileSync(
      './sessions.json',
      JSON.stringify(this.#sessions),
      'utf-8'
    );
  }

  set(key, value) {
    if (!value) {
      value = {};
    }
    this.#sessions[key] = value;
    this.#storeSessions();
  }

  get(key) {
    return this.#sessions[key];
  }

  init(res) {
    const sessionId = uuid.v4();
    this.set(sessionId);

    return sessionId;
  }

  destroy(req, res) {
    const sessionId = req.sessionId;
    delete this.#sessions[sessionId];
    this.#storeSessions();
  }
}

const sessions = new Session();

app.use((req, res, next) => {
  let currentSession = {};
  let sessionId = req.get(SESSION_KEY);

  if (sessionId) {
    currentSession = sessions.get(sessionId);
    if (!currentSession) {
      currentSession = {};
      sessionId = sessions.init(res);
    }
  } else {
    sessionId = sessions.init(res);
  }

  req.session = currentSession;
  req.sessionId = sessionId;

  onFinished(req, () => {
    const currentSession = req.session;
    const sessionId = req.sessionId;
    sessions.set(sessionId, currentSession);
  });

  next();
});

app.get('/', (req, res) => {
  if (req.session.username) {
    return res.json({
      username: req.session.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
  sessions.destroy(req, res);
  res.redirect('/');
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  if (!attempsManager.canLogin(login))
    res.status(401).json({ waitTime: attempsManager.waitTime });

  try {
    const { accessToken, refreshToken } = await userToken.getUserAccessToken(
      login,
      password
    );

    tokensStorage.upsert(login, { refreshToken });
    await tokensStorage.store();

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

app.post('/api/register', (req, res) => {});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);

  const appAccessToken = await appToken.getAppAccessToken();

  console.log({ appAccessToken });
});
