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

const saveAll = () => {
  const interval = document.getElementById(intervalField).value;
  const workStatus = document.getElementById(workStatusField).checked;

  storage.set(
    {
      [intervalField]: interval,
      [workStatusField]: workStatus,
    },
    () => {
      success(intervalField, workStatusField);
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

  storage.get([intervalField, workStatusField], (result) => {
    console.log(result);
    const interval = result[intervalField];
    const workStatus = result[workStatusField];

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
  });

  document.getElementById('setIntervalBtn').addEventListener('click', (e) => {
    e.preventDefault();
    saveAll();
  });

};


// })();
