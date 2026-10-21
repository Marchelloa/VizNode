import { notifyAppEvent, notifyStateChanged } from "./observer.js";
import { setByPath } from "./state.js";

/**
 * Подключает состояние, фабрику сервера, actions и operations.
 * Обработчики получают ctx; requestRender обновляет представления.
 */
export function createApplication({ 
    state,
    createServer,
    actions,
    operations,
    requestRender,
}) {
    if (typeof requestRender !== "function") {
        throw new TypeError("requestRender must be a function");
    }

    const server = createServer();

    /** Общие зависимости обработчиков и операций. */
    const ctx = {
        state,
        operations,
        server,
        requestRender,
        notifyStateChanged,
        notifyAppEvent,
    };

    function notify(reason) {
      notifyAppEvent("notify", { message: reason });
    }

    /** Уведомляет наблюдателей, но не вызывает render. */
    function setStatus(phase, message) {
      state.status.phase = phase;
      state.status.message = message;
      notifyStateChanged(state, `status_${phase}`);
    }

    /** Уведомляет наблюдателей, но не вызывает render. */
    function clearStatus() {
      state.status.phase = "idle";
      state.status.message = "";
      notifyStateChanged(state, "status_cleared");
    }

    /**
     * Проверка формы на клиенте; бизнес-ограничения проверяет сервер.
     * @param {{recipient: string, amount: string}} form
     * @returns {{ok: true} | {ok: false, reason: string}}
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

    /** Управляет уведомлениями и render; Promise не ожидает отложенный сброс статуса. */
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

    const actionHandlers = actions;

    /**
     * Renderer отправляет события сюда, а не меняет state напрямую.
     * Ожидает обработчик, но не фоновые операции; ошибки передаёт вызывающему коду.
     * @param {{type: "action", intent: string} | {type: "input", bind: string, value: string}} event
     * @returns {Promise<boolean>} Принятие события, а не успех бизнес-операции.
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

            await handler(ctx);
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

