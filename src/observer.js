// ---------------- STATE OBSERVER ----------------
const stateListeners = [];

function onStateChange(listener) {
  stateListeners.push(listener);
}


function notifyStateChanged(state, reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateListeners) {
    listener(snapshot, reason);
  }
}   


export {
    onStateChange,
    notifyStateChanged,
}
