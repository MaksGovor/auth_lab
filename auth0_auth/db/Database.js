'use strict';

const fsp = require('fs/promises');

class DataBase {
  #data;
  constructor(path = './tokens.json') {
    this.path = path;
    try {
      this.#data = fs.readFileSync(this.path, 'utf8');
      this.#data = JSON.parse(this.#data.trim());
    } catch (e) {
      this.#data = {};
    }
  }

  upsert(key, data) {
    this.#data[key] = data || {};
  }

  getData(key) {
    if (this.#data[key]) return this.#data[key];
    return null;
  }

  deleteByFind(callback) {
    for (const key in this.#data) {
      if (callback(this.#data[key])) {
        this.#data[key] = {};
        return key;
      }
    }
  }

  find(callback) {
    for (const key in this.#data) {
      if (callback(this.#data[key])) {
        return key;
      }
    }
  }

  async store() {
    try {
      const buffer = JSON.stringify(this.#data);
      await fsp.writeFile(this.path, buffer);
    } catch (err) {}
  }
}

module.exports = DataBase;
