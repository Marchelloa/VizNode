// ---------------- UI NODE FACTORIES ----------------
function textNode(text) {
  return {
    type: "text",
    props: { text },
  };
}

function actionNode(id, label, intent = null) {
  return {
    type: "action",
    props: { id, label, intent: intent || id },
  };
}

function inputNode(id, label, bind, value = "", placeholder = "") {
  return {
    type: "input",
    props: { id, label, bind, value, placeholder },
  };
}

function menuNode(title, items = []) {
  return {
    type: "menu",
    props: { title, items },
  };
}

function containerNode(title, children = []) {
  return {
    type: "container",
    props: { title, children },
  };
}

export {
    textNode,
    actionNode,
    inputNode,
    menuNode,
    containerNode
}