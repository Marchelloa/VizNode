import { renderDOM } from "./dom-renderer.js";


// Находим корневой элемент и подключаем SSE.
const root = document.querySelector("#app");
const events = new EventSource("http://127.0.0.1:3000/api/events");
const DISPATCH_ENDPOINT = "http://127.0.0.1:3000/api/dispatch";

// Храним завершение последнего запроса.
let lastDispatchPromise = Promise.resolve();

// Значения полей, ещё ожидающие подтверждения отправки.
const pendingInputs = new Map();

// Значения полей из последнего SSE-дерева.
const confirmedInputs = new Map();

// Собираем значения input-нод, включая вложенные.
function collectInputValues(nodes) {
    for (const node of nodes) {
        if (node.type === "input") {
            confirmedInputs.set(node.props.bind, node.props.value);
        } else if (node.type === "menu") {
            collectInputValues(node.props.items);
        } else if (node.type === "container") {
            collectInputValues(node.props.children);
        }
    }
}

// Убираем локальное значение после подтверждения.
function removeConfirmedPendingInputs() {
    for (const [bind, pending] of pendingInputs) {
        if (
            pending.accepted &&
            confirmedInputs.has(bind) &&
            confirmedInputs.get(bind) === pending.value
        ) {
            pendingInputs.delete(bind);
        }
    }
}
/**
 * Отправляет одно событие в Node runtime HTTP-запросом.
 * Не управляет очередью и не обновляет DOM.
 *
 * @param {
 *   {type: "action", intent: string} |
 *   {type: "input", bind: string, value: string}
 * } event — событие для application.dispatch.
 * @returns {Promise<boolean>} true при успешном HTTP-ответе и handled: true.
 * Promise отклоняется при сетевой ошибке или ошибке разбора ответа.
 */
async function sendEvent(event) {
    const response = await fetch(DISPATCH_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(event),
    });

    const result = await response.json();

    return response.ok && result.handled === true;
}

/**
 * Ставит пользовательское событие в последовательную очередь отправки.
 * Следующий запрос начинается после завершения предыдущего.
 * Ошибка запроса передаётся вызывающему коду, но не блокирует очередь.
 *
 * action: intent — идентификатор действия приложения.
 * input: bind — путь к полю состояния, value — новое значение поля.
 * После изменения state новое дерево приходит через SSE.
 *
 * @param {
 *   {type: "action", intent: string} |
 *   {type: "input", bind: string, value: string}
 * } event — событие для application.dispatch.
 * @returns {Promise<boolean>} принято ли событие приложением;
 * не означает успешное завершение бизнес-операции.
 *
 * @example
 * await dispatchEvent({
 *   type: "action",
 *   intent: "open_transfer",
 * });
 */
function dispatchEvent(event) {
    const pending = lastDispatchPromise.then(() => sendEvent(event));

    // Ошибка одного запроса не блокирует следующие.
    lastDispatchPromise = pending.catch(() => {});

    return pending;
}

// Получаем дерево с сервера и обновляем DOM.
events.onmessage = (event) => {
    try {
        const tree = JSON.parse(event.data);

        confirmedInputs.clear();
        collectInputValues(tree);
        removeConfirmedPendingInputs();

        renderDOM(tree, root, pendingInputs);
    } catch (error) {
        console.error("Unable to render the received tree.", error);
    }
}

// Сообщаем об обрыве — SSE переподключится автоматически.
events.onerror = () => {
    console.error("SSE connection lost; waiting for reconnection.");
};

// Перехватываем клики внутри приложения.
root.addEventListener("click", (event) => {
    // Пропускаем клики без DOM-элемента.
    if (!(event.target instanceof Element)) {
        return;
    }

    // Ищем ближайший элемент с действием.
    const action = event.target.closest("[data-intent]");

    // Пропускаем клики без действия или вне приложения.
    if (!action || !root.contains(action)) {
        return;
    }

    // Отправляем intent на сервер и проверяем результат.
    void dispatchEvent({
        type: "action",
        intent: action.dataset.intent,
    }).then((handled) => {
        if (!handled) {
            console.error("DOM action was rejected.");
        }
    }).catch((error) => {
        console.error("Unable to dispatch DOM action.", error);
    });
});

// Перехватываем изменение полей внутри приложения.
root.addEventListener("input", (event) => {
    const input = event.target;

    if (
        !(input instanceof HTMLInputElement) ||
        !root.contains(input) ||
        !input.dataset.bind
    ) {
        return;
    }

    const bind = input.dataset.bind;
    const pending = {
        value: input.value,
        accepted: false,
    };

    // Сохраняем последнее значение до отправки.
    pendingInputs.set(bind, pending)

    void dispatchEvent({
        type: "input",
        bind,
        value: pending.value,
    }).then((handled) => {
        if (!handled) {
            console.error("DOM input was rejected.");
            return;
        }

        pending.accepted = true;
        removeConfirmedPendingInputs();
    }).catch((error) => {
        console.error("Unable to dispatch DOM input.", error);
    });
})
