import { renderDOM } from "./dom-renderer.js";


const root = document.querySelector("#app");
const events = new EventSource("http://127.0.0.1:3000/api/events");
const DISPATCH_ENDPOINT = "http://127.0.0.1:3000/api/dispatch";


/**
 * Передаёт нормализованное DOM-событие Node runtime.
 *
 * Обновлять DOM самостоятельно не требуется: после изменения state
 * новое дерево придёт через SSE.
 *
 * @param {object} event
 * @returns {Promise<boolean>} было ли событие принято приложением.
 */
async function dispatchEvent(event) {
    const response = await fetch(DISPATCH_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(event),
    });

    const result = await response.json();

    return response.ok && result.handled === true;
}

events.onmessage = (event) => {
    try {
        const tree = JSON.parse(event.data);
        renderDOM(tree, root);
    } catch (error) {
        console.error("Unable to render the received tree.", error);
    }
}

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

