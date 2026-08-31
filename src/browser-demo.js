import { renderDOM } from "./dom-renderer.js";
import { buildTree } from "./tree.js";
import { state } from "./state.js";

const root = document.querySelector("#app");

const tree = buildTree(state);

renderDOM(tree, root);