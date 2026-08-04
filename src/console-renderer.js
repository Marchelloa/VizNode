// ---------------- CONSOLE RENDERER HELPERS ----------------
/**
 * Возвращает дочерние элементы составной UI-ноды.
 *
 * @param {object} node — UI-нода.
 * @returns {Array<object>} дочерние ноды или пустой массив для конечной ноды.
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

// ---------------- CONSOLE RENDER UTILS ----------------
/**
 * Выводит одну строку в консоль.
 *
 * @param {*} text — выводимое значение.
 * @returns {void}
 */
function print(text) {
  console.log(text);
}

/**
 * Добавляет пустую строку для визуального разделения блоков интерфейса.
 *
 * @returns {void}
 */
function spacer() {
  console.log("");
}

// ---------------- CONSOLE RENDERER ----------------
/**
 * Последовательно рендерит коллекцию дочерних нод.
 *
 * Общие `actionMap` и `index` сохраняют сквозную нумерацию интерактивных нод.
 *
 * @param {Array<object>} children — дочерние UI-ноды.
 * @param {Object<string, object>} actionMap — карта номера пункта к UI-ноде.
 * @param {{value: number}} index — изменяемый счётчик пунктов.
 * @returns {void}
 */
function renderChildren(children, actionMap, index) {
  for (const child of children) {
    renderNode(child, actionMap, index);
  }
}

/**
 * Рендерит одну UI-ноду в соответствии с её типом.
 *
 * Интерактивные action/input-ноды регистрируются в `actionMap`, а составные
 * menu/container-ноды рекурсивно передают рендеринг дочерним элементам.
 *
 * @param {object} node — UI-нода для рендеринга.
 * @param {Object<string, object>} actionMap — карта доступных пользователю пунктов.
 * @param {{value: number}} index — изменяемый счётчик пунктов.
 * @returns {void}
 */
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

/**
 * Очищает консоль, рендерит корневое дерево и строит карту доступных действий.
 *
 * @param {Array<object>} tree — корневые UI-ноды текущего экрана.
 * @returns {Object<string, object>} соответствие введённого номера интерактивной ноде.
 */
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
