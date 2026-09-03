import { renderDOM } from "./dom-renderer.js";
import { buildTree } from "./tree.js";
import { createApplication } from "./application.js";


const root = document.querySelector("#app");

function render() {
    const tree = buildTree(application.state);
    renderDOM(tree, root);
}

const application = createApplication({requestRender: render});

root.addEventListener("click", event => {
    const action = event.target.closest("[data-intent]");

    if (!action) return;

    void application.dispatch({
        type: "action",
        intent: action.dataset.intent
    });
});

render();
