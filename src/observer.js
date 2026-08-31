// ---------------- STATE OBSERVER ----------------
const stateListeners = [];
const appEventListeners = [];

/**
 * Регистрирует наблюдателя изменений состояния.
 *
 * @param {(snapshot: object, reason: string) => void} listener — обработчик снимка state.
 * @returns {void}
 */
function onStateChange(listener) {
  stateListeners.push(listener);
}

/**
 * Регистрирует наблюдателя событий приложения.
 *
 * @param {(eventName: string, payload: object) => void} listener — обработчик события.
 * @returns {void}
 */
function onAppEvent(listener) {
  appEventListeners.push(listener);
}


/**
 * Создаёт независимый снимок текущего состояния и передаёт его
 * всем зарегистрированным наблюдателям.
 *
 * @param {object} state — текущее состояние приложения.
 * @param {string} reason — причина изменения состояния.
 * @returns {void}
 */
function notifyStateChanged(state, reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateListeners) {
    listener(snapshot, reason);
  }
}

/**
 * Создаёт снимок данных события и передаёт его всем наблюдателям приложения.
 *
 * Канал предназначен для пользовательских уведомлений и событий, которые сами
 * по себе не являются изменением состояния.
 *
 * @param {string} eventName — имя события приложения.
 * @param {object} payload — данные события.
 * @returns {void}
 */
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
