const AppName = 'VFGParser';

console.log('____Starting', AppName);

class LoginError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'LoginError'; // (2)
  }
}

class ContentError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'ContentError'; // (2)
  }
}

function sendError(ErrorClass, error, errorContext) {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.error,
    ErrorClass,
    error,
    errorContext,
  }, (response) => log('farewell', response.farewell));
}

const sync = false;

const storage = sync ? chrome.storage.sync : chrome.storage.local;

const defaultTimer = 60e30;
const intervalField = 'interval';
const workStatusField = 'workStatus';
const emailField = 'email';
const passwordField = 'password';

const StatusEnum = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const MessageTypeEnum = {
  status: 'status',
  capture: 'capture',
  parse: 'parse',
  openNew: 'openNew',
  loggedIn: 'loggedIn',
  error: 'error',
  loginError: 'loginError',
  contentError: 'contentError',
  closeAllTheRest: 'closeAllTheRest',
};

const Centers = {
  kyiv: {
    value: 5508,
    label: 'Kyiv',
  },
  lviv: {
    value: 5507,
    label: 'Lviv',
  },
  dnipro: {
    value: 5512,
    label: 'Dnipro',
  },
  odesa: {
    value: 5513,
    label: 'Odesa', // ⚓
  },
  kharkiv: {
    value: 5510,
    label: 'Kharkiv',
  },
  ivanofranko: {
    value: 5509,
    label: 'Ivano-Franko',
  },
  uzhgorod: {
    value: 5511,
    label: 'Uzhgorod',
  },
};

const reasons = {
  e90: 2841,
  passportCollection: 4347,
};
