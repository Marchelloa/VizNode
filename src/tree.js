import {
  textNode,
  actionNode,
  inputNode,
  menuNode,
  containerNode,
} from "./nodes.js";


// ---------------- SCREEN TREE BUILDER ----------------
/**
 * Строит UI-дерево для текущего экрана на основе состояния приложения.
 *
 * Функция только описывает интерфейс и не выполняет рендеринг или изменение state.
 * При наличии статусного сообщения оно добавляется в дерево отдельным контейнером.
 *
 * @param {object} currentState — снимок или текущее состояние приложения.
 * @returns {Array<object>} корневые UI-ноды активного экрана.
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
