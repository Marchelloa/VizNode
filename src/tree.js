import {
  textNode,
  actionNode,
  inputNode,
  menuNode,
  containerNode,
} from "./nodes.js";


// ---------------- SCREEN TREE BUILDER ----------------
export function buildTree(currentState) {
  if (currentState.screen === "main") {
    return [
      textNode("VizNode Bank"),

      menuNode("Main Menu", [
        actionNode("show_balance", "Check Balance"),
        actionNode("open_transfer", "Transfer"),
      ]),
    ];
  }

  if (currentState.screen === "balance") {
    return [
      containerNode("VizNode Bank", [
        textNode(`Your balance: ${currentState.balance} ₽`),
      ]),

      menuNode("Actions", [
        actionNode("back", "Back"),
      ]),
    ];
  }

  if (currentState.screen === "transfer") {
    return [
      textNode("Transfer"),

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
