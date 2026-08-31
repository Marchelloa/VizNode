// ---------------- EFFECT LOG -------------------------
const effectLog = [];

/**
 * Добавляет сообщение во внутренний журнал побочных эффектов.
 *
 * @param {string} message — строка журнала.
 * @returns {void}
 */
function logEffect(message) {
  effectLog.push(message);
}

// ---------------- DEMO SERVER HANDLERS ----------------
/**
 * Имитирует серверный обработчик события отправки перевода в журнале эффектов.
 *
 * Функция демонстрационная: фактический перевод выполняется через `server.js`.
 *
 * @param {{recipient: string, amount: string|number}} data — данные перевода.
 * @returns {void}
 */
function serverTransferHandler(data) {
  logEffect("[SERVER] Transfer handler called");
  logEffect(`[SERVER] Recipient: ${data.recipient}`);
  logEffect(`[SERVER] Amount: ${data.amount}`);
}

/**
 * Подключает стандартные обработчики изменений state и событий приложения.
 *
 * @param {object} channels — функции регистрации наблюдателей.
 * @param {Function} channels.onStateChange — регистрация state-наблюдателя.
 * @param {Function} channels.onAppEvent — регистрация наблюдателя событий приложения.
 * @returns {void}
 */
function registerEffects({ onStateChange, onAppEvent }) {
  onStateChange((snapshot, reason) => {
    logEffect(`[STATE] ${reason}`);
  });

  onAppEvent((eventName, payload) => {
    if (eventName === "notify") {
      logEffect(`[NOTICE] ${payload.message}`);
      return;
    }

    logEffect(`[EVENT] ${eventName}`);
  });

  onAppEvent((eventName, payload) => {
    if (eventName !== "submit_transfer") {
      return;
    }

    serverTransferHandler({
      recipient: payload.recipient,
      amount: payload.amount,
    });
  });
}

export {
    effectLog,
    registerEffects,
}
