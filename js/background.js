this.log = console.log.bind(this, '____bg');
log('____Background VFG parser');


async function postData(url = '', data, options) {
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
      ...options,
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

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        log('tabs', tabs);
        var tab = tabs[0];
        if (!tab) return; // Sanity check
        log('currTab', tab);
        chrome.tabs.captureVisibleTab({
          format: 'jpeg',
        }, (stream) => {
          // log('captureVisibleTab', stream);
          // sendResponse({ stream: stream });

          let canvas;
          let offscreen;
          if (!canvas) {
            canvas = document.createElement('canvas');
            // document.body.appendChild(canvas);
          }
          log('canvas', canvas /*croppedDataUrl*/);


          // offscreen = canvas.transferControlToOffscreen();
          log('offscreen', offscreen /*croppedDataUrl*/);

          const dimensions = request.dimensions;
          const ratio = window.devicePixelRatio;
          var partialImage = new Image();
          let context;
          partialImage.src = stream;
          partialImage.onload = function () {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            // offscreen.width = dimensions.width;
            // offscreen.height = dimensions.height;
            context = canvas.getContext('2d');
            // context = offscreen.getContext('2d');
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

            const apikey = 'AIzaSyC_AIWfdTYKONJFnBcViBPv4Z__8ZRUxnM';
            const visionURL = 'https://vision.googleapis.com/v1/images:annotate?key=' + apikey;
            // const bitMap = offscreen.transferToImageBitmap();
            // offscreen.transferToImageBitmap((blob) => {
            const image = croppedDataUrl.replace(/^data:image\/\w+;base64,/, '');
            // log('croppedDataUrl', croppedDataUrl)
            // log('image', image)
            (async () => {
              try {
                const result = await postData(visionURL, {
                    requests: [
                      {
                        image: {
                          content: image,
                          // content: croppedDataUrl,
                          // content: canvas.toBlob(),
                          // content: offscreen.convertToBlob(),
                          // content: offscreen.transferToImageBitmap(),
                          // content: blob,
                          // content: bitMap,
                        },
                        features: [
                          {
                            type: 'TEXT_DETECTION',
                            maxResults: 1,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json; charset=utf-8',
                    },
                  });
                // log('result', result);
                console.log('result', result);
                if (result.error) {
                  return console.error('result', result.error.message);
                }

                const text = result.responses[0].fullTextAnnotation.text;
                const captchaText = text.trim().replace(/\ /g, '');

                try {
                  (() => {
                    log('commit');
                    // context.commit();
                    // canvas.getContext('2d').transferFromImageBitmap(bitMap);
                    // var croppedDataUrl = canvas.toDataURL('image/jpeg', 1.0);
                    log('croppedDataUrl', true /*croppedDataUrl*/);
                    sendResponse({ stream: croppedDataUrl, captchaText });
                  })();
                } catch (e) {
                  console.error(e);
                }
              } catch (e) {
                console.error(e);
              }
            })();


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
    // if (request.type === MessageTypeEnum.openNew) {
    //   const url = 'https://row1.vfsglobal.com/GlobalAppointment/Home/SelectVAC?q=dePiaPfL2MJ7yDPEmQRU6fRZbx3aIpSal6PdG3Bxqq7rSNU6HabciCVot9dEwkhd';
    //
    //   chrome.tabs.create({ url: url }, (tab1) => {
    //     console.log('tab1', tab1);
    //   });
    //   sendResponse({ farewell: 'success' });
    // }

    if (request.type === MessageTypeEnum.loggedIn) {
      log('close OpenTab', request, sender);
      sendResponse({
        farewell: 'closing',
      });
      setTimeout(() => chrome.tabs.remove(sender.tab.id), 5e3);
      storage.get([emailField], (result) => {
        const email = result[emailField];
        postBot(`Login Success!\nEmail: ${email}`);
      });
    }

    if (request.type === MessageTypeEnum.loginError) {
      storage.get([emailField], (result) => {
        const email = result[emailField];
        postBot(`Login Error:\n${request.error}\nEmail: ${email}`);
        sendResponse({farewell: 'send'})
      });
    }

    if (request.type === MessageTypeEnum.parse) {
      log(sender.tab ?
        'from a content script:' + sender.tab.url :
        'from the extension');

      sendResponse({ farewell: 'goodbye' });

      if (request.status === StatusEnum.SUCCESS) {
        postBot(`Center: ${request.center}\nDate: ${request.date}`);
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
        // postBot(`Center: ${request.center}\nNo data is available`);
      }
    }
    return true;
  },
);
