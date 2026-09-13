import { renderDOM } from "./dom-renderer.js";


const root = document.querySelector("#app");
const events = new EventSource("http://127.0.0.1:3000/api/events");

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

