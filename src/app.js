// ---------------- IMPORTS ----------------
import readline from "readline";
import { createServer } from "./server.js";

import { buildTree } from "./tree.js";

import { renderConsole, print, spacer } from "./renderer.js";

import {
  onStateChange,
  onAppEvent,
  notifyStateChanged,
  notifyAppEvent,
} from "./observer.js";

import { effectLog, registerEffects } from "./effects.js"

import { state, setByPath } from "./state.js";


registerEffects({
  onStateChange,
  onAppEvent,
});

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
    notifyAppEvent("submit_transfer", {
      recipient: state.transferForm.recipient,
      amount: state.transferForm.amount,
    });

    submitTransferFlow();
    return false;
  },

  back() {
    state.screen = "main";
    notifyStateChanged(state, "back");
    return true;
  },
};


const server = createServer();

// ---------------- NOTIFY ----------------
function notify(reason) {
  notifyAppEvent("notify", { message: reason });
}

// ---------------- LOCAL VALIDATION ----------------
function validateTransferForm(form) {
  if (!form.recipient.trim()) {
    return { ok: false, reason: "Recipient is required" };
  }

  if (!form.amount.trim()) {
    return { ok: false, reason: "Amount is required" };
  }
  
  const amount = Number(form.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "Amount must be a positive number" };
  }

  return { ok: true };
}


async function submitTransferFlow() {
  const form = {
    recipient: state.transferForm.recipient,
    amount: state.transferForm.amount,
  };

  const validation = validateTransferForm(form);
  if (!validation.ok) {
    notify(validation.reason);
    setTimeout(loop, 1200);
    return false;
  }

  const response = await server.executeTransfer({
    recipient: form.recipient,
    amount: Number(form.amount),
  });

  if (!response.ok) {
    notify(response.reason);
    setTimeout(loop, 1200);
    return false;
  }

  state.balance = response.data.balance;
  state.transferForm.recipient = "";
  state.transferForm.amount = "";
  state.screen = "main";
  notifyStateChanged(state, "transfer_applied");

  notify("Transfer completed");
  setTimeout(loop, 1200);
  return false;
}

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

function handleClose() {
  spacer();
  print("=== EFFECT LOG ===");
  spacer();

  for (const message of effectLog) {
    print(message);
  }

  print("\nBye.");
  process.exit(0);
}

rl.on("close", handleClose);


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
