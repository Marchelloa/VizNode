// ---------------- STATE OBSERVER ----------------
const stateListeners = [];
const appEventListeners = [];

function onStateChange(listener) {
  stateListeners.push(listener);
}

function onAppEvent(listener) {
  appEventListeners.push(listener);
}


function notifyStateChanged(state, reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateListeners) {
    listener(snapshot, reason);
  }
}

function notifyAppEvent(eventName, payload = {}) {
  const snapshot = structuredClone(payload);

  for (const listener of appEventListeners) {
    listener(eventName, snapshot);
  }
}


export {
  onStateChange,
  onAppEvent,
  notifyStateChanged,
  notifyAppEvent,
}
