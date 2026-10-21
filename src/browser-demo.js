import { renderDOM } from "./dom-renderer.js";

const root = document.querySelector("#app");
const events = new EventSource("http://127.0.0.1:3000/api/events");
const DISPATCH_ENDPOINT = "http://127.0.0.1:3000/api/dispatch";

let lastDispatchPromise = Promise.resolve();

// Значения полей, ещё ожидающие подтверждения отправки.
const pendingInputs = new Map();

// Значения полей из последнего SSE-дерева.
const confirmedInputs = new Map();

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
 * Сетевые ошибки и ошибки JSON отклоняют Promise.
 * @param {{type: "action", intent: string} | {type: "input", bind: string, value: string}} event
 * @returns {Promise<boolean>} Принято ли событие приложением.
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
 * Последовательно отправляет события. Ошибка передаётся вызывающему коду,
 * но не блокирует следующие запросы. Дерево обновляется через SSE.
 * @returns {Promise<boolean>} Принятие события, а не завершение операции.
 */
function dispatchEvent(event) {
    const pending = lastDispatchPromise.then(() => sendEvent(event));

    // Ошибка одного запроса не блокирует следующие.
    lastDispatchPromise = pending.catch(() => {});

    return pending;
}

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

root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const action = event.target.closest("[data-intent]");

    if (!action || !root.contains(action)) {
        return;
    }

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
