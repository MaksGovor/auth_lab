'use strict';

class AttemptManager {
  #currentCount = {};
  #canLogin = {};
  #attempsCount;
  #waitTimeoutMsec;

  constructor(attempsCount = 3, waitTimeoutMsec = 5 * 1000) {
    this.#attempsCount = attempsCount - 1;
    this.#waitTimeoutMsec = waitTimeoutMsec;
  }

  addAttempt(login) {
    if (!Object.keys(this.#canLogin).includes(login)) this.#resetAttemps(login);

    if (this.#canLogin[login]) {
      if (this.#currentCount[login] >= this.#attempsCount) {
        this.#canLogin[login] = false;
        setTimeout(() => {
          this.#canLogin[login] = true;
          this.#currentCount[login] = 0;
        }, this.#waitTimeoutMsec);
        return;
      }
      this.#currentCount[login]++;
    }
  }

  successLogin(login) {
    this.#canLogin[login] = true;
    this.#currentCount[login] = 0;
  }

  canLogin(login) {
    if (!Object.keys(this.#canLogin).includes(login)) this.#resetAttemps(login);

    return this.#canLogin[login];
  }

  #resetAttemps(login) {
    this.#canLogin[login] = true;
    this.#currentCount[login] = 0;
  }

  get waitTime() {
    return this.#waitTimeoutMsec;
  }
}

module.exports = AttemptManager;
