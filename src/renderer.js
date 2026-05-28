// ---------------- CONSOLE RENDERER HELPERS ----------------
function getChildren(node) {
  if (node.type === "menu") {
    return node.props.items;
  }

  if (node.type === "container") {
    return node.props.children;
  }

  return [];
}

// ---------------- CONSOLE RENDER UTILS ----------------
function print(text) {
  console.log(text);
}

function spacer() {
  console.log("");
}

// ---------------- CONSOLE RENDERER ----------------
function renderChildren(children, actionMap, index) {
  for (const child of children) {
    renderNode(child, actionMap, index);
  }
}

function renderNode(node, actionMap, index) {
  if (node.type === "text") {
    print(node.props.text);
    spacer();
    return;
  }

  if (node.type === "action") {
    print(`${index.value}. ${node.props.label}`);
    actionMap[String(index.value)] = node;
    index.value += 1;
    return;
  }

  if (node.type === "input") {
    const shownValue = node.props.value || `[${node.props.placeholder}]`;
    print(`${index.value}. ${node.props.label}: ${shownValue}`);
    actionMap[String(index.value)] = node;
    index.value += 1;
    return;
  }

  if (node.type === "menu" || node.type === "container") {
    if (node.props.title) {
      print(node.props.title);
    }

    renderChildren(getChildren(node), actionMap, index);
    spacer();
    return;
  }
}

function renderConsole(tree) {
  console.clear();

  const actionMap = {};
  const index = { value: 1 };

  renderChildren(tree, actionMap, index);

  return actionMap;
}

export {
  renderConsole,
  print,
  spacer,
};