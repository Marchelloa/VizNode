// ---------------- IMPORTS ----------------
import readline from "readline";


// ---------------- APP STATE ----------------
const state = {
  screen: "main",
  balance: 12500,
  transferForm: {
    recipient: "",
    amount: "",
  },
};


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


// ---------------- STATE HELPERS ----------------
function setByPath(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();

  let target = obj;

  for (const key of keys) {
    if (!(key in target)) {
      console.log(`Invalid bind path: ${path}`);
      return false;
    }

    target = target[key];
  }

  if (!(lastKey in target)) {
    console.log(`Invalid bind path: ${path}`);
    return false;
  }

  target[lastKey] = value;
  return true;
}


// ---------------- SCREEN TREE BUILDER ----------------
function buildTree(currentState) {
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


// ---------------- CONSOLE RENDERER HELPERS ----------------
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
function print(text) {
  console.log(text);
}

function spacer() {
  console.log("");
}


// ---------------- CONSOLE RENDERER ----------------
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

function renderConsole(tree) {
  console.clear();
  
  const actionMap = {};
  const index = { value: 1 };

  renderChildren(tree, actionMap, index);

  return actionMap;
}


// ---------------- ACTION HANDLERS ----------------
const actionHandlers = {
  show_balance() {
    state.screen = "balance";
    return true;
  },

  open_transfer() {
    state.screen = "transfer";
    return true;
  },

  submit_transfer() {
    notifyStateChanged("submit_transfer");

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
    loop();
  });
}


// ---------------- READLINE SETUP ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", () => {
  console.log("\nBye.");
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


// ---------------- STATE OBSERVER ----------------
const stateListeners = [];

function onStateChange(listener) {
  stateListeners.push(listener);
}

function notifyStateChanged(reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateListeners) {
    listener(snapshot, reason);
  }
}

// ---------------- DEMO SERVER HANDLERS ----------------
function serverTransferHandler(data) {
  print("\n[SERVER] Transfer handler called");
  print(`[SERVER] Recipient: ${data.recipient}`);
  print(`[SERVER] Amount: ${data.amount}`);
}

onStateChange((snapshot, reason) => {
  if (reason !== "submit_transfer") {
    return;
  }

  serverTransferHandler({
    recipient: snapshot.transferForm.recipient,
    amount: snapshot.transferForm.amount,
  });
});
