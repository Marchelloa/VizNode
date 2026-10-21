
function getChildren(node) {
  if (node.type === "menu") {
    return node.props.items;
  }

  if (node.type === "container") {
    return node.props.children;
  }

  return [];
}

function print(text) {
  console.log(text);
}

function spacer() {
  console.log("");
}

/** Общий index сохраняет сквозную нумерацию во вложенных группах. */
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

/** Возвращает карту «номер пункта → интерактивная нода». */
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
