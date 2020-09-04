this.log = console.log.bind(this, '____openTabs');

chrome.runtime.sendMessage({
  type: MessageTypeEnum.loggedIn,
}, (response) => {
  if (response) console.log('farewell', response.farewell);
});

// chrome.runtime.sendMessage({
//   type: MessageTypeEnum.openNew,
// }, (response) => {
//   if (response) console.log('farewell', response.farewell);
// });

const click = () => {
  log('click');
  const link = document.querySelector('.leftNav-ul li a');
  link.setAttribute('target', '_blank');
  link.click();
};

window.onload = () => {
  log('onload');
  click();
};


// document.onready = () => {
//   log('onready');
//   click();
// };
