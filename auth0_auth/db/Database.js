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

  async upsert(key, data) {
    this.#data[key] = data || {};
    await this.store();
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

  async deleteByKey(key) {
    if (key) delete this.#data[key];
    await this.store();
  }

  async store() {
    try {
      const buffer = JSON.stringify(this.#data);
      await fsp.writeFile(this.path, buffer);
    } catch (err) {}
  }
}

module.exports = DataBase;
