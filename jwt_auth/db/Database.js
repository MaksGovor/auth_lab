'use strict';

const fs = require('fs');

class DataBase {
  constructor(path = './tokens.json') {
    this.path = path;
  }

  static parseJsonDB(path) {
    try {
      return JSON.parse(fs.readFileSync(path));
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  upsert(id, data) {
    const db = JSON.parse(fs.readFileSync(this.path));
    db[id] = data || {};
    fs.writeFileSync(this.path, JSON.stringify(db));
  }

  getData(id) {
    const db = JSON.parse(fs.readFileSync(this.path));
    if (db[id]) return db[id];
    return null;
  }

  deleteByFind(callback) {
    const db = JSON.parse(fs.readFileSync(this.path));
    for (let key in db) {
      if (callback(db[key])) {
        db[key] = {};
        fs.writeFileSync(this.path, JSON.stringify(db));
        return key;
      }
    }
  }

  find(callback) {
    const db = JSON.parse(fs.readFileSync(this.path));
    for (let key in db) {
      if (callback(db[key])) {
        return key;
      }
    }
  }
}

module.exports = DataBase;
