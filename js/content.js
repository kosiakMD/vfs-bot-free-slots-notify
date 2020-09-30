this.log = console.log.bind(this, '____content');

function sendContentError(error, errorContext) {
  const errorClass = ContentError;
  sendError(errorClass, error, errorContext)
}

// function getText_0() {
//   return $('.price-break-down-audit-layer-NoData > table tr:nth-child(2) > td > label').text();
// }

// function getStatus_0() {
//   const pars = getText().split(staticString);
//   const info = pars[1];
//   console.log('info', info);
//   if (info !== noSlot) {
//     return true;
//   } else {
//     return false;
//   }
// }

function getText() {
  return $('label#lblDate').text();
}

// function getName() {
//   return $('.header-user').text().slice(0, -2);
// }

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
// const staticString = 'Earliest slot available on';
// const noSlot = 'No Prime slots available for this Visa Category';

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

function selectCenter() {
  const visaCategoryId = document.querySelector('#VisaCategoryId');
  const locationId = document.querySelector('#LocationId');
  log('visaCategoryId', visaCategoryId, visaCategoryId.value);
  log('locationId', locationId, locationId.value);
  if (visaCategoryId.value && visaCategoryId.value != 0) {
    start();
  } else {
    log('Select Center');
    const kyiv = 5508;
    const lviv = 5507;
    const e90 = 2841;
    const passportCollection = 4347;

    visaCategoryId.addEventListener('DOMNodeInserted', () => {
      //   log('DOMNodeInserted');
      visaCategoryId.value = e90;
      visaCategoryId.dispatchEvent(new Event('change', { bubbles: true }));
    });


    locationId.value = kyiv;
    locationId.dispatchEvent(new Event('change', { bubbles: true }));


    // VisaApplicationForm
    $('#VisaCategoryId').append('<option value="' + e90 + '">E90</option>');
    $('#VisaCategoryId option[value="' + e90 + '"]').prop('selected', true);
    // $('#VisaCategoryId').value(e90);
    // $('#VisaCategoryId option:eq(1)').prop('selected', true);
    // visaCategoryId.value = e90;

  }
}

const errors = [
  'Error while processing your application, please contact us.',
];

function errorValidation() {
  // const errorHref = document.querySelector('.main-container h2');
  // return !(errorHref && errors.includes(errorHref.innerText));
  const doesFormExist = Boolean(document.querySelector('#VisaApplicationForm'));
  if (!doesFormExist) {
    sendContentError('No Form at the page - Server Side Error')
  }
  return doesFormExist;
}

function startProcess() {
  storage.get([workStatusField], (result) => {
    const workStatus = result[workStatusField];
    console.warn(`Bot is Turned-${workStatus ? 'ON' : 'OFF'}`);
    // Bot is Turned OFF
    if (!workStatus) return;

    if (errorValidation()) {
      setTimeout(selectCenter, 500);
    } else {
      window.location.search = '';
      window.location.pathname = '/GlobalAppointment';
    }

  });
}

// document.addEventListener('DOMContentLoaded', () => {
//   log('DOMContentLoaded');
//   start();
// });

$(() => {
  log('$(() => {})()');

  startProcess();
})();

// scripts = document.head.querySelectorAll('script');
// console.log('___', scripts);
// for (let script of scripts) {
//   console.log(script);
//   // document.head.removeChild(script)
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('___onMessage status', request, sender);
  if (request.type !== MessageTypeEnum.status) return;
  console.log(sender.tab ?
    'from a content script:' + sender.tab.url :
    'from the extension');

  if (request.status) {
    if (!timer) start();
  } else {
    if (timer) stop();
  }

});
