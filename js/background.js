this.log = console.log.bind(this, '____bg');
this.error = console.error.bind(this, '____bg');
this.postError = (e, dataArray) => {
  storage.get([emailField], (result) => {
    const email = result[emailField];
    const data = (dataArray && dataArray.length) ? `\n${args.join('\n')}` : '';
    postLogBot(`❌ Error!\nEmail: ${email}\n${e}${data}`);
  });
};

log('____Background VFG parser');

const TrackedTabs = [];
const checkCenters = [
  Centers.kyiv, Centers.dnipro,
];

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

const telegramBotID = 'bot357889888:AAGIW1gbGthb2GUakr4WdeHaagauaimOEXc';
const logChatID = '-273523250';
const successChatID = '-489049348';

function postBot(chatID, msg = '_') {
  const url = `https://api.telegram.org/${telegramBotID}/sendMessage`;
  const data = {
    'chat_id': chatID,
    'text': msg,
  };
  return postData(url, data);
}

function postLogBot(msg = '_') {
  return postBot(logChatID, msg);
}

function postSuccessBot(msg = '_') {
  return postBot(successChatID, msg);
}

function recognizeCaptcha(imageBase64) {
  const apikey = 'AIzaSyC_AIWfdTYKONJFnBcViBPv4Z__8ZRUxnM';
  const visionURL = 'https://vision.googleapis.com/v1/images:annotate?key=' + apikey;
  const image = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  return postData(visionURL, {
      requests: [
        {
          image: {
            content: image,
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
}

function handleCaptchaText(dimensions, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    log('tabs', tabs);
    const tab = tabs[0];
    if (!tab) return; // Sanity check
    log('currTab', tab);
    chrome.tabs.captureVisibleTab({
      format: 'jpeg',
    }, (stream) => {
      // log('captureVisibleTab', stream);
      // sendResponse({ stream: stream });

      let canvas;
      // let offscreen;
      if (!canvas) {
        canvas = document.createElement('canvas');
        // document.body.appendChild(canvas);
      }
      log('canvas', canvas /*croppedDataUrl*/);


      // offscreen = canvas.transferControlToOffscreen();
      // log('offscreen', offscreen /*croppedDataUrl*/);

      const ratio = window.devicePixelRatio;
      const partialImage = new Image();
      let context;
      partialImage.src = stream;
      partialImage.onload = async function () {
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
        const croppedDataUrl = canvas.toDataURL('image/png');
        try {
          const result = await recognizeCaptcha(croppedDataUrl);
          log('result', result);
          if (result.error) {
            postError(result.error);
            return error('result', result.error.message);
          }

          // log(JSON.stringify(result));
          let captchaText = '';
          try {
            const text = result.responses[0].fullTextAnnotation.text;
            captchaText = text.trim().replace(/\ /g, '');
          } catch (e) {
            error(e);
            log(result);
            postError(e, [JSON.stringify(result)]);
          }

          // log('croppedDataUrl', croppedDataUrl);
          log('captchaText', captchaText);
          sendResponse({ stream: croppedDataUrl, captchaText });
        } catch (e) {
          console.error(e);
          postError(e);
        }

      };

    });
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    log('___onMessage', request.type, request, sender);

    const type = request.type;
    const tabId = sender.tab.id;

    switch (type) {
      case MessageTypeEnum.closeAllTheRest: {
        chrome.tabs.query({ url: '*://row1.vfsglobal.com/*' }, (tabs) => {
          log('tabs', tabs);
          tabs.map(tab => {
            if (tab.id !== tabId) {
              chrome.tabs.remove(tab.id);
            }
          });
        });
        break;
      }

      case MessageTypeEnum.capture: {
        const dimensions = request.dimensions;
        chrome.tabs.update(tabId, { highlighted: true });
        handleCaptchaText(dimensions, sendResponse);
        break;
      }

      case MessageTypeEnum.loggedIn: {
        log('close OpenTab', request, sender);
        sendResponse({
          farewell: 'opening Tabs',
          openNew: !!checkCenters.length,
        });
        // setTimeout(() => chrome.tabs.remove(tabId), 5e3);
        storage.get([emailField], (result) => {
          const email = result[emailField];
          postLogBot(`✅ Login Success!\nEmail: ${email}`);
        });
        break;
      }

      case MessageTypeEnum.openNew: {
        log('openNew', request, sender);
        chrome.tabs.query({ url: '*://row1.vfsglobal.com/*' }, (tabs) => {
          let id;
          const openedTabs = [];
          const trackedTabs = [];
          tabs.map(tab => {
            TrackedTabs.map(trackedTab => {
              if (tab.id !== tabId) {
                chrome.tabs.remove(tab.id);
              }
            });
          });
          if (checkCenters.length) {
            TrackedTabs.push({ center: checkCenters.pop(), tabId = });
            sendResponse({
              farewell: 'opening Tabs',
              openNew: !!checkCenters.length,
            });
          }
          // setTimeout(() => chrome.tabs.remove(tabId), 5e3);
        }
        break;
      }


      case MessageTypeEnum.loginError: {
        postError(new LoginError(request.error));
        break;
      }

      case MessageTypeEnum.parse: {
        log(sender.tab ?
          'from a content script:' + sender.tab.url :
          'from the extension');

        sendResponse({ farewell: 'goodbye' });

        if (request.status === StatusEnum.SUCCESS) {
          postSuccessBot(`🛂 Center: ${request.center}\n🗓 Date: ${request.date}`);
          postLogBot(`🛂 Center: ${request.center}\n🗓 Date: ${request.date}`);
          const creationCallback = (id) => {
            log('creationCallback', id);
            chrome.notifications.clear(id);
          };
          const options = {
            type: 'basic',
            title: 'VFG: date is available',
            message: `Center: ${request.center}\n${request.status}`,
            iconUrl: 'icons/icon128.png',
            imageUrl: 'icons/icon128.png',
          };
          const id = request.center || '0';
          const notify = chrome.notifications.create(id, options, creationCallback);
          log('notify', notify);

        } else {
          postLogBot(`🛂 Center: ${request.center}\n⭕️ No data is available`);
        }
        break;
      }
    }

    return true; // for async response
  },
);
