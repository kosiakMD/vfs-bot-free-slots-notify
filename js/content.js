function getText_0() {
  return $('.price-break-down-audit-layer-NoData > table tr:nth-child(2) > td > label').text();
}

function getStatus_0() {
  const pars = getText().split(staticString);
  const info = pars[1];
  console.log('info', info);
  if (info !== noSlot) {
    return true;
  } else {
    return false;
  }
}

function getText() {
  return $('label#lblDate').text();
}

function getName() {
  return $('.header-user').text().slice(0, -2);
}

function getCenter() {
  return $('select#LocationId option:selected').text();
}

function showStatus(tag = '_') {
  const status = getText();
  const center = getCenter();
  console.log('____', status, tag);
  chrome.runtime.sendMessage({
    type: MessageTypeEnum.parse,
    status: status ? StatusEnum.SUCCESS : StatusEnum.FAIL,
    date: status && status,
    center,
  }, function (response) {
    console.log(response.farewell);
  });
}

function reLoad() {
  location.reload();
}

let timer = null;
const staticString = 'Earliest slot available on';
const noSlot = 'No Prime slots available for this Visa Category';

function start() {
  storage.get([intervalField, workStatusField], (result) => {
    console.log('___', result);
    const interval = result[intervalField] || defaultTimer;
    const workStatus = result[workStatusField];

    if (workStatus) {
      showStatus(0);
      timer = setTimeout(reLoad, Number(interval) * 1000);
    }
  });
}

function stop() {
  clearTimeout(timer);
}

document.addEventListener('DOMContentLoaded', start);
$(start)();

scripts = document.head.querySelectorAll('script')
console.log('___', scripts);
for (let script of scripts) {
  console.log(script)
  // document.head.removeChild(script)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('___onMessage status', request, sender);
  if (request.name !== MessageTypeEnum.status) return;
  console.log(sender.tab ?
    'from a content script:' + sender.tab.url :
    'from the extension');

  if (request.status) {
    if (!timer) start();
  } else {
    if (timer) stop();
  }

})
