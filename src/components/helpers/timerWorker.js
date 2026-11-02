let timerId;

onmessage = event => {
  const { action, interval } = event.data;

  if (action === 'start') {
    if (timerId) {
      clearInterval(timerId);
    }
    timerId = setInterval(() => {
      postMessage('tick');
    }, interval);
  } else if (action === 'stop') {
    clearInterval(timerId);
    timerId = null;
  }
};
