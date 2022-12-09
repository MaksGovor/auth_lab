'use strict';

const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const { port, sessionKey } = require('./config');
const appToken = require('./token-utils/app-token');
const AttemptManager = require('./attempt-manager');

const attempsManager = new AttemptManager();
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

const users = [
  {
    login: 'Login',
    password: 'Password',
    username: 'Username',
  },
  {
    login: 'MaksGovor',
    password: 'ip-93',
    username: 'Maks Govoruha',
  },
];

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  if (!attempsManager.canLogin(login))
    res.status(401).json({ waitTime: attempsManager.waitTime });

  const user = users.find(
    (user) => user.login === login && user.password === password
  );

  if (user) {
    attempsManager.sucseccLogin(login);
    req.session.username = user.username;
    req.session.login = user.login;

    res.json({ token: req.sessionId });
  }

  attempsManager.addAttempt(login);
  res.status(401).send();
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);

  const appAccessToken = await appToken.getAppAccessToken();

  console.log({ appAccessToken });
});
