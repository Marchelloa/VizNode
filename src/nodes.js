// ---------------- UI NODE FACTORIES ----------------
/**
 * Создаёт текстовую UI-ноду.
 *
 * @param {string} text — отображаемый текст.
 * @returns {{type: "text", props: {text: string}}} текстовая нода.
 */
function textNode(text) {
  return {
    type: "text",
    props: { text },
  };
}

/**
 * Создаёт UI-ноду пользовательского действия.
 *
 * Если намерение не передано, идентификатор используется и как intent.
 *
 * @param {string} id — уникальный идентификатор действия.
 * @param {string} label — подпись действия в интерфейсе.
 * @param {?string} intent — имя обработчика пользовательского намерения.
 * @returns {{type: "action", props: object}} action-нода.
 */
function actionNode(id, label, intent = null) {
  return {
    type: "action",
    props: { id, label, intent: intent || id },
  };
}

/**
 * Создаёт редактируемую UI-ноду, связанную с полем состояния.
 *
 * @param {string} id — уникальный идентификатор поля.
 * @param {string} label — подпись поля.
 * @param {string} bind — путь к связанному полю state.
 * @param {string} value — текущее значение.
 * @param {string} placeholder — подсказка для пустого значения.
 * @returns {{type: "input", props: object}} input-нода.
 */
function inputNode(id, label, bind, value = "", placeholder = "") {
  return {
    type: "input",
    props: { id, label, bind, value, placeholder },
  };
}

/**
 * Создаёт меню из нод, доступных для выбора пользователем.
 *
 * @param {string} title — заголовок меню.
 * @param {Array<object>} items — элементы меню.
 * @returns {{type: "menu", props: object}} нода меню.
 */
function menuNode(title, items = []) {
  return {
    type: "menu",
    props: { title, items },
  };
}

/**
 * Создаёт смысловой контейнер для группы дочерних UI-нод.
 *
 * @param {string} title — заголовок группы.
 * @param {Array<object>} children — дочерние ноды.
 * @returns {{type: "container", props: object}} нода-контейнер.
 */
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
