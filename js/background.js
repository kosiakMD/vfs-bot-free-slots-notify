this.log = console.log.bind(this, '____bg');
this.error = console.error.bind(this, '____bg');
this.postError = (e, errorContext) => {
  storage.get([emailField], (result) => {
    const email = result[emailField];
    // const details = (errorContext && errorContext.length) ? `\n${errorContext.join('\n')}` : '';
    const details = errorContext ? `\n${errorContext}` : '';
    postLogBot(`❌ Error!\nEmail: ${email}\n${e}${details}`);
  });
};

log('____Background VFG parser');

const telegramBotID = 'bot357889888:AAGIW1gbGthb2GUakr4WdeHaagauaimOEXc';
const logChatID = '-273523250';
const successChatID = '-489049348';

let centersTracked = [];
let centersToTrack = [];
const centersChecked = [Centers.kyiv, Centers.dnipro];

// rest all at the start
resetCentersToTrack();

function resetCentersToTrack() {
  log('resetCentersToTrack');
  centersTracked = [];
  centersToTrack = centersChecked.concat();
}

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
      error(response.error);
    }
    return response.json(); // parses JSON response into native JavaScript objects
  } catch (e) {
    log(e);
    error(e);
    return e;
  }
}

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

function handleCaptchaText(tabId, dimensions, sendResponse) {
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // chrome.tabs.get(tabId, (tabs) => {
  //   log('tabs', tabs);
  //   const tab = tabs[0];
  //   if (!tab) return; // Sanity check
  //   log('currTab', tab);
  chrome.tabs.captureVisibleTab({
    // chrome.tabCapture.capture({
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
          error(result.error);
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
          postError(e, JSON.stringify(result));
        }

        // log('croppedDataUrl', croppedDataUrl);
        log('captchaText', captchaText);
        sendResponse({ stream: croppedDataUrl, captchaText });
        return true;
      } catch (e) {
        error(e);
        postError(e);
      }

    };

  });
  // });
}

function removeOnCreated() {
  chrome.tabs.onCreated.removeListener(onNewTabOpen);
  // chrome.tabs.onUpdated.removeListener(onNewTabUpdate);
}

function addOnCreated() {
  chrome.tabs.onCreated.addListener(onNewTabOpen);
  chrome.tabs.onUpdated.addListener(onNewTabUpdate);
}

function onNewTabOpen(newTab) {
  log('onCreated', newTab);
  setTimeout(() => {
    log('onCreated 2', newTab);
    removeOnCreated();
  }, 1000);
  // removeOnCreated();
}

function onNewTabUpdate(newTab) {
  log('onUpdated', newTab);
  setTimeout(() => {
    log('onUpdated 2', newTab);
    // removeOnCreated();
  }, 1000);
  // removeOnCreated();
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
          const closeAllTabs = tabs.map(tab =>
            new Promise((resolve, reject) => {
              try {
                if (tab.id !== tabId) {
                  chrome.tabs.remove(tab.id, resolve);
                }
              } catch (e) {
                postError(e, 'chrome.tabs.remove');
                reject(e);
              }
            }),
          );
          // reset tracked centers and centers to track according to tabs
          Promise.all(closeAllTabs).then(resetCentersToTrack);
        });
        break;
      }

      case MessageTypeEnum.capture: {
        const dimensions = request.dimensions;
        chrome.tabs.update(tabId, { highlighted: true });
        handleCaptchaText(tabId, dimensions, sendResponse);
        return true;
        break;
      }

      case MessageTypeEnum.loggedIn: {
        log('logged In', request, sender);
        addOnCreated();
        sendResponse({
          farewell: 'opening Tabs',
          openNew: !!centersToTrack.length,
          count: centersToTrack.length,
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
        sendResponse({
          farewell: 'opening Tabs',
          openNew: false,
        });
        // chrome.tabs.query({ url: '*://row1.vfsglobal.com/*' }, (tabs) => {
        // let id;
        // const openedTabs = [];
        // const trackedTabs = [];
        // tabs.map(tab => {
        //   centersTracked.map(trackedTab => {
        //     if (tab.id !== tabId) {
        //       chrome.tabs.remove(tab.id);
        //     }
        //   });
        // });
        // if (centersToTrack.length) {
        //   centersTracked.push({ center: centersToTrack.pop(), tabId = });
        //   sendResponse({
        //     farewell: 'opening Tabs',
        //     openNew: !!centersToTrack.length,
        //   });
        // }
        // setTimeout(() => chrome.tabs.remove(tabId), 5e3);
        // });
        break;
      }

      // case MessageTypeEnum.loginError: {
      //   postError(new LoginError(request.error));
      //   break;
      // }
      case MessageTypeEnum.error: {
        const ErrorClass = request.ErrorClass;
        postError(new ErrorClass(request.error), request.errorContext);
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

const cacheLife = 86400; // 24hours

const caches = [
  'https://row1.vfsglobal.com/GlobalAppointment/Scripts/jquery.modalbox-1.5.0-min.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/js/SpryAccordion.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/SpryAccordion.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/App-Styles/css/jquery.modalbox.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/App-Styles/css/jquery.modalbox-basic.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/App-Styles/css/jquery.modalbox-skin-precious-white.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css', // ???
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/bootstrap-theme.min.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/style.css',
];

const blocks = [
  'https://row1.vfsglobal.com/GlobalAppointment/Content/themes/base/jquery.ui.all.css',
];

const urls = [
  'https://row1.vfsglobal.com/GlobalAppointment/Scripts/jquery-3.5.0.min.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/themes/base/jquery.ui.base.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/themes/base/jquery.ui.theme.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Scripts/jquery.magnific-popup.min.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/js/jquery.selectBox.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/jquery.selectBox.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/js/jquery.jqtransform.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/jqtransform.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/bootstrap.min.css',
  // 'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/bootstrap-theme.min.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/js/bootstrap.min.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/js/bootstrap-datetimepicker.min.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/bootstrap-datetimepicker.min.css',
  'https://row1.vfsglobal.com/GlobalAppointment/Scripts/jquery-migrate-3.0.1.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Scripts/jquery.countdown.js',
  'https://row1.vfsglobal.com/GlobalAppointment/Content/CMS-Styles/css/jquery.countdown.css', // changes in the file
];

const cdns = [
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.0/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/base/theme.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/0.9.9/jquery.magnific-popup.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery.selectbox/1.2.0/jquery.selectBox.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery.selectbox/1.2.0/jquery.selectBox.css',
  'http://cdn.wna.me/Validform/Validform_v5.3.2/demo/plugin/jqtransform/jquery.jqtransform-min.js',
  'http://cdn.wna.me/Validform/Validform_v5.3.2/demo/plugin/jqtransform/jqtransform.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.0.1/jquery-migrate.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-countdown/1.0.0/jquery.countdown.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-countdown/1.0.0/jquery.countdown.css',
];

function addBlockers() {
  const excludesForHeaders = ['.css', '.js', '.jp', '.png', '.gif'];
  const excludesOnPages = ['.css', '.js', '.jp', '.png', '.gif'];
  const excludesOnLogin = ['.js', '.jp', '.png'];
  const loginUrls = ['://row1.vfsglobal.com/GlobalAppointment', '://row1.vfsglobal.com/GlobalAppointment/'];
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (!details.url.includes('row1.vfsglobal.com')) return;
      const excludes = details.url.endsWith(loginUrls[0]) || details.url.endsWith(loginUrls[1]) ? excludesOnLogin : excludesOnPages;
      let except = false;
      excludes.map((ext) => {
        if (!except && details.url.includes(ext)) {
          except = true;
        }
      });
      if (!except) {
        if (details.method === 'POST') {
          log('____onBeforeRequest', details);
        }
        return { cancel: false };
      } else {
        // log('url', details.url);
        log('____block', details.url);

        const index = urls.indexOf(details.url);
        if (index >= 0) {
          return {
            redirectUrl: cdns[index],
          };
        } else if (blocks.includes(details.url)) {
          return { cancel: true };
        } else {
          return { cancel: false };
        }
      }
      // return { cancel: details.url.indexOf('://www.evil.com/') != -1 };
    },
    { urls: ['*://row1.vfsglobal.com/*'] },
    ['blocking', 'requestBody'],
  );

  // chrome.webRequest.onBeforeSendHeaders.addListener(
  //   function (details) {
  //     if (!details.url.includes('row1.vfsglobal.com')) return;
  //     const excludes = details.url.endsWith(loginUrls[0]) || details.url.endsWith(loginUrls[1]) ? excludesOnLogin : excludesOnPages;
  //     let except = false;
  //     excludes.map((ext) => {
  //       if (!except && details.url.includes(ext)) {
  //         except = true;
  //       }
  //     });
  //     return {
  //       requestHeaders: [
  //         ...details.requestHeaders,
  //         { name: 'Connection', value: 'close' },
  //       ],
  //     };
  //   },
  //   { urls: ['*://row1.vfsglobal.com/*'] },
  //   ['blocking',  'requestHeaders', 'extraHeaders'],
  // );
  chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
      if (!details.url.includes('row1.vfsglobal.com')) return;
      const excludes = details.url.endsWith(loginUrls[0]) || details.url.endsWith(loginUrls[1]) ? excludesOnLogin : excludesOnPages;
      let except = false;
      excludes.map((ext) => {
        if (!except && details.url.includes(ext)) {
          except = true;
        }
      });
      if (except) {
        // if (caches.includes(details.url)) {
        log('\n__Cache onHeadersReceived:', details.url, '\n', details.responseHeaders, '\n', details.extraHeaders, '\n');
        const responseHeaders = [...details.responseHeaders];
        const cc = responseHeaders.find(x => x['name'] === 'Cache-Control');
        cc['value'] = `private, max-age=${cacheLife}, immutable`; // min-fresh=${cacheLife},
        // const exp = responseHeaders.find(x => x['name'] === 'Expires');
        // exp['value'] = `${cacheLife}`;
        // const pragma = responseHeaders.find( x => x['name'] === 'Pragma');
        // pragma['value'] = '';
        const pragmaIndex = responseHeaders.findIndex(x => x['name'] === 'Pragma');
        responseHeaders.splice(pragmaIndex, 1);
        const expIndex = responseHeaders.findIndex(x => x['name'] === 'Expires');
        responseHeaders.splice(expIndex, 1);
        return {
          responseHeaders,
          // extraHeaders: [
          // responseHeaders: [
          //   ...details.responseHeaders,
          //   {
          //     name: 'Cache-Control',
          //     value: `public, max-age=${cacheLife}`, // private
          //   },
          // ],
        };
      }
    },
    { urls: ['*://row1.vfsglobal.com/*'] },
    ['blocking', 'responseHeaders', 'extraHeaders'],
  );
  chrome.webRequest.onResponseStarted.addListener(
    function (details) {
      if (!details.url.includes('row1.vfsglobal.com')) return;
      //     const excludes = details.url.endsWith(loginUrls[0]) || details.url.endsWith(loginUrls[1]) ? excludesOnLogin : excludesOnPages;
      //     let except = false;
      //     excludes.map((ext) => {
      //       if (!except && details.url.includes(ext)) {
      //         except = true;
      //       }
      //     });
      //     if (!except) {
      //       if (details.method === 'POST') {
      //         log('____onBeforeRequest', details);
      //       }
      //       return { cancel: false };
      //     } else {
      //       // log('url', details.url);
      //       log('____block', details.url);
      //       log('\nrequestHeaders', details.requestHeaders);
      //       return { cancel: true };
      //     }
      if (caches.includes(details.url)) {
        log('\n__Cache onResponseStarted:', details.url, '\n', details.responseHeaders, '\n', details.extraHeaders, '\n');
        // return {
        //   responseHeaders: [
        //     // ...details.responseHeaders,
        //     { Connection: 'close' },
        //     {
        //       name: 'Cache-Control',
        //       value: `private, max-age=${cacheLife}`,
        //     },
        //   ],
        // };
      }
    },
    { urls: ['*://row1.vfsglobal.com/*'] },
    ['responseHeaders', 'extraHeaders'],
  );

  chrome.webRequest.onSendHeaders.addListener(
    function (details) {
      if (!details.url.includes('row1.vfsglobal.com')) return;
      let except = false;
      excludesForHeaders.map((ext) => {
        if (!except && details.url.includes(ext)) {
          except = true;
        }
      });
      if (caches.includes(details.url)) {
        log('\n\n__Caches', details, '\n\n');
      }
      if (!except) {
        log('____onSendHeaders', details);

        // return { cancel: false };
      } else {
        // log('\nrequestHeaders', details.requestHeaders);
        // log('url', details.url);
        // return { cancel: true };
      }
      return true;
    },
    { urls: ['*://row1.vfsglobal.com/*'] },
    ['requestHeaders'],
  );
}

addBlockers();

chrome.runtime.onSuspend.addListener(function () {
  log('Unloading.');
  chrome.browserAction.setBadgeText({ text: '' });
});
