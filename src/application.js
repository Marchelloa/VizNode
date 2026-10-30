import { notifyAppEvent, notifyStateChanged } from "./observer.js";
import { setByPath } from "./state.js";

/**
 * Подключает состояние, сервисы, actions и operations.
 * Обработчики получают общий ctx.
 */
export function createApplication({ 
    state,
    services = {},
    actions,
    operations,
    requestRender,
}) {
    if (typeof requestRender !== "function") {
        throw new TypeError("requestRender must be a function");
    }

    /** Общие зависимости обработчиков и операций. */
    const ctx = {
        state,
        operations,
        services,
        requestRender,
        notifyStateChanged,
        notifyAppEvent,
    };

 
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

            operations.clearStatus(ctx);
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

