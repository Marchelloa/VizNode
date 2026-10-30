import {
  textNode,
  actionNode,
  inputNode,
  menuNode,
  containerNode,
} from "./nodes.js";

/** Строит общее для renderer дерево, не изменяя состояние. */
export function buildTree(currentState) {
  const statusNodes = currentState.message
    ? [
        containerNode("Status", [
          textNode(currentState.message),
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
