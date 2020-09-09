this.log = console.log.bind(this, '____Popup');

function formField(name) {
  return `${AppName}_${name}`;
}

function success(...fields) {
  console.log(`${fields.join(', ')} saved`);
}


const saveInterval = () => storage.set(
  { [intervalField]: document.getElementById(intervalField).value },
  () => {
    success(intervalField);
  },
);

const saveStatus = () => storage.set(
  { [workStatusField]: document.getElementById(workStatusField).checked },
  () => {
    success(workStatusField);
  },
);

const saveEmail = () => storage.set(
  { [emailField]: document.getElementById(emailField).checked },
  () => {
    success(emailField);
  },
);

const savePassword = () => storage.set(
  { [passwordField]: document.getElementById(passwordField).checked },
  () => {
    success(passwordField);
  },
);

const saveAll = () => {
  const interval = document.getElementById(intervalField).value;
  log('interval', interval);
  const workStatus = document.getElementById(workStatusField).checked;
  log('workStatus', workStatus);
  const email = document.getElementById(emailField).value;
  log('email', email);
  const password = document.getElementById(passwordField).value;
  log('password', password);

  storage.set(
    {
      [intervalField]: interval,
      [workStatusField]: workStatus,
      [emailField]: email,
      [passwordField]: password,
    },
    () => {
      success(intervalField, workStatusField, emailField, passwordField);
    },
  );

  let tabs = [];
  chrome.tabs.query({ url: 'https://row1.vfsglobal.com/GlobalAppointment/Home/SelectVAC' }, (args) => {
    console.log(args);
    tabs = args;
  });
  tabs.map(
    tab => chrome.tabs.sendMessage(tab.id, {
        // type: MessageTypeEnum.status,
        // status: workStatus,
        type: 'status',
      },
    ),
  );

  // chrome.runtime.sendMessage({
  //   type: MessageTypeEnum.status,
  //   status: workStatus,
  // }, function (response) {
  //   console.log('response', response);
  //   if (response) console.log('farewell', response.farewell);
  //   return true;
  // });

};

// $(() => {
window.onload = () => {

  storage.get([intervalField, workStatusField, emailField, passwordField], (result) => {
    console.log(result);
    const interval = result[intervalField];
    const workStatus = result[workStatusField];
    const email = result[emailField];
    const password = result[passwordField];

    if (interval) {
      console.log('interval', interval);
      document.getElementById(intervalField).value = interval;
    } else {
      saveInterval();
    }
    if (workStatus !== undefined) {
      console.log('workStatus', workStatus);
      document.getElementById(workStatusField).checked = workStatus;
    } else {
      saveStatus();
    }
    if (email !== undefined) {
      console.log('email', email);
      document.getElementById(emailField).value = email || '';
    } else {
      saveEmail();
    }
    if (password !== undefined) {
      console.log('password', password);
      document.getElementById(passwordField).value = password || '';
    } else {
      savePassword();
    }
  });

  document.getElementById('setIntervalBtn').addEventListener('click', (e) => {
    // e.preventDefault();
    saveAll();
  });

  const $centers = $('#centers');
  $centers.append(() => {
    const children = [];
    for (let centerName in Centers) {
      const center = Centers[centerName];
      log(centerName, center);
      const { value, label } = center;
      const $el = $(
        `<label for="${value}" class="row jc-sb">${label}
            <input id="${value}" name="${value}" type="checkbox" />
         </label>`,
      );
      children.push($el);
    }
    return children;
  });

  log('submit form id', document.getElementById('form'));
  document.getElementById('form').addEventListener('submit', (e, a1, a2) => {
    log('submiting');
    e.preventDefault();
    log(e, a1, a2);
    log('.serialize()', $('#form').serialize(), $('#form').serializeArray())
  });

};


// })();
