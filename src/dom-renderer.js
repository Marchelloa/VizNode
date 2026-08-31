/**
 * Заменяет содержимое корневого элемента DOM-представлением UI-дерева.
 *
 * @param {Array<object>} tree
 * @param {HTMLElement} root
 * @returns {void}
 */
export function renderDOM(tree, root) {
    if (!root) {
        throw new TypeError("DOM render root is required");
    }

    if (!Array.isArray(tree)) {
        throw new TypeError("UI tree must be an array");
    }

    const document = root.ownerDocument;
    const fragment = document.createDocumentFragment();

    for (const node of tree) {
        fragment.append(createNodeElement(node, document));
    }

    root.replaceChildren(fragment);
}

/**
 * Возвращает дочерние ноды составного элемента.
 *
 * @param {object} node
 * @returns {Array<object>}
 */
function getChildren(node) {
    if (node.type === "menu") {
        return node.props.items;
    }

    if (node.type === "container") {
        return node.props.children;
    }

    return [];
}
/**
 * Создаёт DOM-элемент для одной UI-ноды.
 *
 * @param {object} node
 * @param {Document} document
 * @returns {HTMLElement}
 */
function createNodeElement(node, document) {
    if (node.type === "text") {
        const element = document.createElement("p");
        element.textContent = node.props.text;
        return element;
    }

    if (node.type === "action") {
        const element = document.createElement("button");

        element.type = "button";
        element.textContent = node.props.label;
        element.dataset.intent = node.props.intent;

        return element;
    }

    if (node.type === "input") {
        const field = document.createElement("label");
        const fieldLabel = document.createElement("span");
        const fieldControl = document.createElement("input");

        fieldLabel.textContent = node.props.label;

        fieldControl.type = "text";
        fieldControl.name = node.props.id;
        fieldControl.value = node.props.value;
        fieldControl.placeholder = node.props.placeholder;
        fieldControl.dataset.bind = node.props.bind;

        field.append(fieldLabel, fieldControl);

        return field;
    }

    if (node.type === "menu" || node.type === "container") {
        const tagName = node.type === "menu" ? "nav" : "section";
        const element = document.createElement(tagName);

        if (node.props.title) {
            const title = document.createElement("h2");
            title.textContent = node.props.title;
            element.append(title);
        }

        for (const child of getChildren(node)) {
            element.append(createNodeElement(child, document));
        }

        return element;
    }

    throw new Error(`Unsupported DOM node type: ${node.type}`);
}
