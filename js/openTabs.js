this.log = console.log.bind(this, '____openTabs');

function loggedIn() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.loggedIn,
  }, responseHandler);
}

function responseHandler(response) {
  if (response) {
    log('response', response);
    if (response.openNew) {
      if (response.count) {
        for (let i = 0; i < response.count; i++) {
          openNewTab();
        }
      } else {
        openNewTab();
      }
    }
  }
}

function openNewTab(callBack) {
  log('click');
  const link = document.querySelector('.leftNav-ul li a');
  link.setAttribute('target', '_blank');
  link.click();
  onTabOpen();
  // callBack && callBack();
}

function onTabOpen() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.openNew,
  }, responseHandler);
}

function start(e) {
  log('Event type:', e.type);
  storage.get([workStatusField], (result) => {
    const workStatus = result[workStatusField];
    console.warn(`Bot is Turned-${workStatus ? 'ON' : 'OFF'}`);
    // Bot is Turned OFF
    if (!workStatus) return;

    loggedIn();
    // onTabOpen();
    // openNewTab();

  });
}

window.onload = start;
document.addEventListener('DOMContentLoaded', start);


// document.onready = () => {
//   log('onready');
//   click();
// };
