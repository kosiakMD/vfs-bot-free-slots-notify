console.log('____Background VFG parser');

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
      console.log(response.error);
      console.error(response.error);
    }
    return response.json(); // parses JSON response into native JavaScript objects
  } catch (e) {
    console.log(e);
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
    if (request.type !== MessageTypeEnum.parse) return;
    console.log('___onMessage parse', request, sender);
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');

    sendResponse({ farewell: 'goodbye' });

    if (request.status === StatusEnum.SUCCESS) {
      postBot(request.date);
      const creationCallback = () => console.log('creationCallback');
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
  });
