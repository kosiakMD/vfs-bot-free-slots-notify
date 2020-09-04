const AppName = 'VFGParser';

console.log('____Starting', AppName);

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
  parse: 'parse',
  openNew: 'openNew',
  loggedIn: 'loggedIn',
  loginError: 'loginError',
};
