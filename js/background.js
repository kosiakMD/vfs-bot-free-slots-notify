var log = console.log.bind(this, '____bg');
log('____Background VFG parser');


async function postData(url = '', data) {
  // Default options are marked with *
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    if (response.error) {
      log(response.error);
      console.error(response.error);
    }
    return response.json(); // parses JSON response into native JavaScript objects
  } catch (e) {
    log(e);
    console.error(e);
    return e;
  }
}

const telegram_bot_id = 'bot357889888:AAGIW1gbGthb2GUakr4WdeHaagauaimOEXc';
const chat_id = '-273523250';

async function postBot(msg = '_') {
  const url = 'https://api.telegram.org/' + telegram_bot_id + '/sendMessage';
  const data = {
    'chat_id': chat_id,
    'text': msg,
  };
  return await postData(url, data);
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    log('___onMessage', request.type, request, sender);
    if (request.type === 'capture') {

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        log('tabs', tabs);
        var tab = tabs[0];
        if (!tab) return; // Sanity check
        log('currTab', tab);
        chrome.tabs.captureVisibleTab({
          format: 'jpeg',
        }, (stream) => {
          log('captureVisibleTab', stream);
          // sendResponse({ stream: stream });

          let canvas;
          if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
          }
          const dimensions = request.dimensions;
          // const dimensions = {
          //   bottom: 470,
          //   height: 70,
          //   left: 293,
          //   right: 503,
          //   top: 400,
          //   width: 210,
          //   x: 293,
          //   y: 400,
          // };
          const ratio = window.devicePixelRatio;
          var partialImage = new Image();
          partialImage.src = stream;
          partialImage.onload = function () {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            var context = canvas.getContext('2d');
            context.drawImage(
              partialImage,
              dimensions.left * ratio,
              dimensions.top * ratio,
              dimensions.width * ratio,
              dimensions.height * ratio,
              0,
              0,
              dimensions.width,
              dimensions.height,
            );
            var croppedDataUrl = canvas.toDataURL('image/png');
            // chrome.tabs.create({
            //   url: croppedDataUrl,
            //   windowId: tab.windowId,
            // });
          // partialImage.src = stream;
          // sendResponse({ stream: partialImage.src });
          sendResponse({ stream: croppedDataUrl });
          };

          // chrome.runtime.sendMessage({
          //   type: 'capture',
          //   stream: stream,
          // }, function (response) {
          //   log('response', response);
          //   response && log('response.stream', response.stream);
          // });
        });
      });

      // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //   log('tabs', tabs);
      //   var currTab = tabs[0];
      //   if (currTab) { // Sanity check
      //     log('currTab', currTab);
      //     chrome.tabCapture.capture({  }, (stream) => {
      //       log('stream', stream);
      //       sendResponse({ stream });
      //     });
      //   }
      // });
    }
    if (request.type === MessageTypeEnum.parse) {
      log(sender.tab ?
        'from a content script:' + sender.tab.url :
        'from the extension');

      sendResponse({ farewell: 'goodbye' });

      if (request.status === StatusEnum.SUCCESS) {
        postBot(request.date);
        const creationCallback = () => log('creationCallback');
        const options = {
          type: 'basic',
          title: 'VFG: date is available',
          message: `Center: ${request.center}\n${request.status}`,
          iconUrl: 'icons/icon128.png',
          imageUrl: 'icons/icon128.png',
        };
        const id = request.center = 0;
        const notify = chrome.notifications.create(id, options, creationCallback);

      } else {
        postBot(`Center: ${request.center}\nNo data is available`);
      }
    }
    return true;
  });
