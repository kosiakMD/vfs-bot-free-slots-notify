this.log = console.log.bind(this, '____Login');
// var log = log.bind(this, '____Login');

log('Start');

const captchaId = 'CaptchaImage';

let captcha;

document.onready = () => {
  log('____onready');
};

window.onload = () => {
  // captcha = document.getElementById(captchaId);
  captcha = document.getElementsByClassName('customcapcha')[0];
  log('captcha', captcha);
  captcha.onloadeddata = () => log('____onloadeddata');
  captcha.onload = () => log('____onload');

  const time = 1000;
  // setTimeout(() => {
  //   html2canvas(captcha, {
  //     logging: true,
  //     allowTaint: true,
  //     // foreignObjectRendering: true,
  //     // canvas: true
  //   }).then(function (canvas) {
  //     log('____canvas', canvas);
  //     document.body.appendChild(canvas);
  //   });
  // }, time);


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log('___onMessage capture', request, sender);
    if (request.type !== 'capture') return;
    log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');

    log(request.stream);

  });

  function submitForm() {
    document.querySelector('#ApplicantListForm').submit();
  }

  function fillForm(captchaText, email, password) {
    document.querySelector('#CaptchaInputText').value = captchaText;
    document.querySelector('#EmailId').value = email;
    document.querySelector('#Password').value = password;
  }

  function fillAndSubmitForm(email, password) {
    chrome.runtime.sendMessage({
      type: 'capture',
      dimensions: document.getElementById('CaptchaImage').getBoundingClientRect(),
    }, function (response) {
      log('response', response);
      // response && log('response.stream', response.stream);
      const img = document.createElement('img');
      img.src = response.stream;
      document.body.appendChild(img);
      const captchaText = response.captchaText;
      log('captchaText', captchaText);

      fillForm(captchaText, email, password);

      submitForm();
    });
  }

  function getError() {
    const errorBlock = document.querySelector('.validation-summary-errors li');
    return errorBlock ? errorBlock.textContent : undefined;
  }

  const Errors = {
    captcha: [
      'The verification words are incorrect.',
      'Слова проверки введены неверно',
      'Слова перевірки введені невірно',
    ],
    blockIncorrectPass: [
      'Your account is locked. Please try accessing the system after 1 minutes.',
      'Ваш обліковий запис заблоковано. Будь ласка, спробуйте зайти до системи через 1 хвилин',
    ],
    blockMultipleEnter: [
      'Your account has been locked, please login after 2 minutes.',
      'Ваш обліковий запис заблоковано, будь ласка, увійдіть після 2 хвилин.',
    ]
  };

  function sendError(error, errorType) {
    chrome.runtime.sendMessage({
      type: MessageTypeEnum.loginError,
      error,
      errorType,
    }, (response) => log('farewell', response.farewell));
  }

  function errorValidation() {
    const reloadPeriodInMin = 8;
    const loginError = getError();
    if (loginError) {
      log('loginError', loginError)
      if (Errors.captcha.includes(loginError)) {
        sendError(loginError, 'captcha');
        // runScript();
        return true;
      } else {
        sendError(loginError, 'other');
        log(`Reload in ${reloadPeriodInMin} min`);
        setTimeout(() => window.location.reload(), reloadPeriodInMin * 60e3);
        return false;
      }
    } else {
      log('runScript')
      // runScript();
      return true;
    }
  }

  function runScript() {
    storage.get([emailField, passwordField, workStatusField], (result) => {
      const workStatus = result[workStatusField];
      console.warn(`Bot is Turned-${workStatus ? 'ON' : 'OFF'}`);
      // Bot is Turned OFF
      if (!workStatus) return;

      const email = result[emailField];
      const password = result[passwordField];
      log('email', email);
      log('password', password);
      if (email && password) {
        if (errorValidation()) {
          fillAndSubmitForm(email, password);
        }
      } else {
        alert('No credentials!');
      }
    });
  }

  runScript();


  // try {
  //   chrome.tabs.captureVisibleTab({
  //     format: 'jpeg',
  //   }, (stream) => {
  //     log('captureVisibleTab', stream);
  //   });
  // } catch (e) {
  //   console.error(e);
  // } finally {
  //
  // }

  // try {
  //   // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   //   var currTab = tabs[0];
  //   //   if (currTab) { // Sanity check
  //   //     log(curreTav);
  //   chrome.tabCapture.capture(currTab, (stream) => {
  //     log(stream);
  //   });
  //   //   }
  //   // });
  // } catch (e) {
  //   console.error(e);
  // } finally {
  //
  // }
};
