import {
  textNode,
  actionNode,
  inputNode,
  menuNode,
  containerNode,
} from "./nodes.js";


// ---------------- SCREEN TREE BUILDER ----------------
/**
 * Строит декларативное дерево интерфейса для текущего состояния приложения.
 *
 * Результат не является состоянием или DOM-деревом. Он независимо от renderer
 * описывает содержимое, структуру и разрешённые взаимодействия интерфейса.
 * Функция не выполняет рендеринг и не изменяет state. При наличии статусного
 * сообщения оно добавляется в дерево отдельным контейнером.
 *
 * @param {object} currentState — текущее состояние приложения.
 * @returns {Array<object>} декларативные ноды текущего интерфейса.
 */
export function buildTree(currentState) {
  const statusNodes = currentState.status.message
    ? [
        containerNode("Status", [
          textNode(currentState.status.message),
        ]),
      ]
    : [];

  if (currentState.screen === "main") {
    return [
      textNode("VizNode Bank"),
      ...statusNodes,

      menuNode("Main Menu", [
        actionNode("show_balance", "Check Balance"),
        actionNode("open_transfer", "Transfer"),
      ]),
    ];
  }

  if (currentState.screen === "balance") {
    return [
      containerNode("VizNode Bank", [
        textNode(`Your balance: ${currentState.balance} RUB`),
      ]),
      ...statusNodes,

      menuNode("Actions", [
        actionNode("back", "Back"),
      ]),
    ];
  }

  if (currentState.screen === "transfer") {
    return [
      textNode("Transfer"),
      ...statusNodes,

      containerNode("Transfer Form", [
        inputNode(
          "recipient",
          "Recipient",
          "transferForm.recipient",
          currentState.transferForm.recipient,
          "Enter recipient name"
        ),
        inputNode(
          "amount",
          "Amount",
          "transferForm.amount",
          currentState.transferForm.amount,
          "Enter amount"
        ),
      ]),

      menuNode("Actions", [
        actionNode("submit_transfer", "Submit"),
        actionNode("back", "Back"),
      ]),
    ];
  }

  return [
    textNode("Unknown state"),
  ];
}
