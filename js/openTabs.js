this.log = console.log.bind(this, '____openTabs');

function click(callBack) {
  log('click');
  const link = document.querySelector('.leftNav-ul li a');
  link.setAttribute('target', '_blank');
  link.click();

  // callBack && callBack();
}

function loggedIn() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.loggedIn,
  }, (response) => {
    if (response) console.log('farewell', response.farewell);
  });
}

function openTabs() {
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.openNew,
  }, (response) => {
    if (response) console.log('farewell', response.farewell);
  });
}

function start() {
  storage.get([workStatusField], (result) => {
    const workStatus = result[workStatusField];
    console.warn(`Bot is Turned-${workStatus ? 'ON' : 'OFF'}`);
    // Bot is Turned OFF
    if (!workStatus) return;

    loggedIn();
    openTabs();
    click();

  });
}

window.onload = () => {
  log('onload');
  start();
};


// document.onready = () => {
//   log('onready');
//   click();
// };
