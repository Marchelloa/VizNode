import { createServer } from "./server.js";
import { notifyAppEvent, notifyStateChanged } from "./observer.js";
import { state, setByPath } from "./state.js";

/**
 * Создаёт прикладное ядро, независимое от способа отображения.
 *
 * @param {object} options
 * @param {Function} options.requestRender — запрашивает повторное построение
 * представления из актуального состояния.
 * @returns {{
 *   state: object,
 *   actionHandlers: Object<string, Function>,
 *   dispatch: Function
 * }}
 */
export function createApplication({ requestRender }) {
    if (typeof requestRender !== "function") {
        throw new TypeError("requestRender must be a function");
    }

    const server = createServer();

    /**
     * Отправляет пользовательское уведомление через канал событий приложения.
     *
     * @param {string} reason — сообщение о результате операции или возникшей проблеме.
     * @returns {void}
     */
    function notify(reason) {
      notifyAppEvent("notify", { message: reason });
    }

    /**
     * Обновляет текущий статус интерфейса и уведомляет наблюдателей состояния.
     *
     * @param {"idle" | "sending" | "success" | "error"} phase — текущая фаза операции.
     * @param {string} message — сообщение, отображаемое пользователю.
     * @returns {void}
     */
    function setStatus(phase, message) {
      state.status.phase = phase;
      state.status.message = message;
      notifyStateChanged(state, `status_${phase}`);
    }

    /**
     * Сбрасывает статус интерфейса в исходное состояние и уведомляет наблюдателей.
     *
     * @returns {void}
     */
    function clearStatus() {
      state.status.phase = "idle";
      state.status.message = "";
      notifyStateChanged(state, "status_cleared");
    }

    /**
     * Проверяет данные формы перед отправкой на сервер.
     *
     * Проверка относится только к требованиям клиентской формы. Бизнес-ограничения,
     * например достаточность баланса, остаются ответственностью сервера.
     *
     * @param {{recipient: string, amount: string}} form — данные формы перевода.
     * @returns {{ok: true} | {ok: false, reason: string}} результат проверки.
     */
    function validateTransferForm(form) {
      if (!form.recipient.trim()) {
        return { ok: false, reason: "Recipient is required" };
      }

      if (!form.amount.trim()) {
        return { ok: false, reason: "Amount is required" };
      }

      const amount = Number(form.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, reason: "Amount must be a positive number" };
      }

      return { ok: true };
    }

    /**
     * Выполняет полный клиентский сценарий перевода.
     *
     * Функция валидирует форму, показывает статус отправки, вызывает сервер,
     * синхронизирует клиентский баланс и сообщает пользователю результат.
     * Повторное отображение функция запрашивает самостоятельно через
     * переданный приложению callback `requestRender`.
     *
     * @returns {Promise<void>}
     */
    async function submitTransferFlow() {
      const form = {
        recipient: state.transferForm.recipient,
        amount: state.transferForm.amount,
      };

      const validation = validateTransferForm(form);
      if (!validation.ok) {
        setStatus("error", validation.reason);
        notify(validation.reason);
        setTimeout(requestRender, 1200);
        return;
      }

      setStatus("sending", "Sending transfer request...");
      requestRender();

      const response = await server.executeTransfer({
        recipient: form.recipient,
        amount: Number(form.amount),
      });

      if (!response.ok) {
        setStatus("error", response.reason);
        notify(response.reason);
        requestRender();
        return;
      }

      state.balance = response.data.balance;
      state.transferForm.recipient = "";
      state.transferForm.amount = "";
      state.screen = "main";
      setStatus("success", `Transfer completed. New balance: ${response.data.balance}`);
      notifyStateChanged(state, "transfer_applied");

      notify("Transfer completed");
      requestRender();
      setTimeout(() => {
        clearStatus();
        requestRender();
      }, 1800);
    }

    const actionHandlers = {
      /**
       * Открывает экран с текущим балансом.
       *
       * Повторное отображение запрашивается после изменения state.
       *
       * @returns {void}
       */
      show_balance() {
        state.screen = "balance";
        notifyStateChanged(state, "show_balance");
        requestRender();
      },

      /**
       * Открывает экран формы перевода.
       *
       * Повторное отображение запрашивается после изменения state.
       *
       * @returns {void}
       */
      open_transfer() {
        state.screen = "transfer";
        notifyStateChanged(state, "open_transfer");
        requestRender();
      },

      /**
       * Публикует событие отправки и запускает асинхронный flow перевода.
       *
       * Асинхронный flow самостоятельно запрашивает повторное отображение
       * при изменении состояния.
       *
       * @returns {void}
       */
      submit_transfer() {
        notifyAppEvent("submit_transfer", {
          recipient: state.transferForm.recipient,
          amount: state.transferForm.amount,
        });

        void submitTransferFlow();
      },

      /**
       * Возвращает пользователя на главный экран.
       *
       * Повторное отображение запрашивается после изменения state.
       *
       * @returns {void}
       */
      back() {
        state.screen = "main";
        notifyStateChanged(state, "back");
        requestRender();
      },
    };

    /**
     * Обрабатывает унифицированное пользовательское событие.
     *
     * Renderer не вызывает actionHandlers и не изменяет state самостоятельно.
     *
     * @param {
     *   {type: "action", intent: string} |
     *   {type: "input", bind: string, value: string}
     * } event
     * @returns {Promise<boolean>} было ли событие принято.
     */
    async function dispatch(event) {
        if (!event || typeof event !== "object") {
            return false;
        }

        if (event.type === "action") {
            const handler = actionHandlers[event.intent];

            if (!handler) {
                return false;
            }

            await handler();
            return true;
        }

        if (event.type === "input") {
            const updated = setByPath(
                state,
                event.bind,
                event.value,
            );

            if (!updated) {
                return false;
            }

            clearStatus();
            notifyStateChanged(state, "input_changed");
            requestRender();

            return true;
        }

        return false;
    }

    return {
        state,
        actionHandlers,
        dispatch,
    };
}

