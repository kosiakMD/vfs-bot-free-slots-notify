function formField(name) {
  return `${AppName}_${name}`;
}

function success(...fields) {
  console.log(`${fields.join(', ')} saved`);
}

// $(() => {
window.onload = () => {

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

    chrome.runtime.sendMessage({
      type: MessageTypeEnum.status,
      status: workStatus,
    }, function (response) {
      console.log(response.farewell);
    });

    storage.set(
      {
        [intervalField]: interval,
        [workStatusField]: workStatus,
      },
      () => {
        success(intervalField, workStatusField);
      },
    );
  };

  storage.get([intervalField, workStatusField], (result) => {
    console.log(result);
    const interval = result[intervalField];
    const workStatus = result[workStatusField];

    if (interval) {
      console.log(interval);
      document.getElementById(intervalField).value = interval;
    } else {
      saveInterval();
    }
    if (workStatus) {
      console.log(workStatus);
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
