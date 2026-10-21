const stateListeners = [];
const appEventListeners = [];

/** @param {(snapshot: object, reason: string) => void} listener */
function onStateChange(listener) {
  stateListeners.push(listener);
}

/** @param {(eventName: string, payload: object) => void} listener */
function onAppEvent(listener) {
  appEventListeners.push(listener);
}

/** Передаёт наблюдателям глубокую копию состояния. */
function notifyStateChanged(state, reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateListeners) {
    listener(snapshot, reason);
  }
}

/** Отдельный от state канал событий; данные передаются глубокой копией. */
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
