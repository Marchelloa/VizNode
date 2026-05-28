// ---------------- IMPORTS ----------------
import readline from "readline";

import {
  buildTree,
} from "./tree.js";

import {
  renderConsole,
  print,
  spacer,
} from "./renderer.js";

import {
  onStateChange,
  notifyStateChanged,
} from "./observer.js";

import {
  effectLog,
  registerEffects,
} from "./effects.js"

import {
  state,
  setByPath,
} from "./state.js";

registerEffects(onStateChange);



// ---------------- ACTION HANDLERS ----------------
const actionHandlers = {
  show_balance() {
    state.screen = "balance";
    notifyStateChanged(state, "show_balance");
    return true;
  },

  open_transfer() {
    state.screen = "transfer";
    notifyStateChanged(state, "open_transfer");
    return true;
  },

  submit_transfer() {
    notifyStateChanged(state, "submit_transfer");

    print("\nTransfer submitted:");
    print(`Recipient: ${state.transferForm.recipient || "(empty)"}`);
    print(`Amount: ${state.transferForm.amount || "(empty)"}`);

    state.transferForm.recipient = "";
    state.transferForm.amount = "";
    state.screen = "main";

    setTimeout(loop, 1200);
    return false;
  },

  back() {
    state.screen = "main";
    notifyStateChanged(state, "back");
    return true;
  },
};


// ---------------- RUNTIME HANDLERS ----------------
function handleAction(actionNode) {
  const intent = actionNode.props.intent;
  const handler = actionHandlers[intent];

  if (!handler) {
    return true;
  }

  return handler();
}

function handleInputEdit(inputNode) {
  rl.question(`${inputNode.props.label}: `, (value) => {
    setByPath(state, inputNode.props.bind, value.trim());
    notifyStateChanged(state, "input_changed");
    loop();
  });
}


// ---------------- READLINE SETUP ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", () => {
  spacer();
  print("=== EFFECT LOG ===");
  spacer();

  for (const message of effectLog) {
    print(message);
  }

  print("\nBye.");
  process.exit(0);
});


// ---------------- MAIN LOOP ----------------
function loop() {
  const tree = buildTree(state);
  const actionMap = renderConsole(tree);

  rl.question("> ", (input) => {
    const trimmed = input.trim();

    if (trimmed === "q" || trimmed === "quit" || trimmed === "exit") {
      rl.close();
      return;
    }

    const target = actionMap[trimmed];

    if (!target) {
      console.log("\nInvalid input. Try again.");
      setTimeout(loop, 1000);
      return;
    }

    if (target.type === "input") {
      handleInputEdit(target);
      return;
    }

    if (target.type === "action") {
      const shouldContinue = handleAction(target);

      if (shouldContinue) {
        loop();
      }

      return;
    }
  });
}

// ---------------- APP START ----------------
loop();
