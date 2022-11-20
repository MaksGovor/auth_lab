'use strict';

class AttemptManager {
  #currentCount = 0;
  #attempsCount;
  #waitTimeoutMsec;
  #canLogin = true;

  constructor(attempsCount = 3, waitTimeoutMsec = 5 * 1000) {
    this.#attempsCount = attempsCount - 1;
    this.#waitTimeoutMsec = waitTimeoutMsec;
  }

  addAttempt() {
    if (this.#canLogin) {
      if (this.#currentCount === this.#attempsCount) {
        this.#canLogin = false;
        setTimeout(() => {
          this.#canLogin = true;
          this.#currentCount = 0;
        }, this.#waitTimeoutMsec);
        return;
      }
    this.#currentCount++;
    }
  }

  sucseccLogin() {
    this.#canLogin = true;
    this.#currentCount = 0;
  }

  get canLogin() {
    return this.#canLogin;
  }

  get waitTime() {
    return this.#waitTimeoutMsec;
  }
}

module.exports = AttemptManager;