const AppName = 'VFGParser';

console.log('____Starting', AppName);

const sync = false;

const storage = sync ? chrome.storage.sync : chrome.storage.local;

const defaultTimer = 60e30;
const intervalField = 'interval';
const workStatusField = 'workStatus';

const StatusEnum = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const MessageTypeEnum = {
  status: 'status',
  parse: 'parse',
};
