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


// ---------------- NODE FACTORIES ----------------
function textNode(text) {
	return {
		type: "text",
		props: {text},
	};
}

function actionNode(id, label, intent = null) {
	return {
		type: "action",
		props: {id, label, intent: intent || id},
	};
}

function inputNode(id, label, bind, value = "", placeholder = "") {
  return {
    type: "input", 
    props: {id, label, bind, value, placeholder},
  };
}

function menuNode(title, items = []) {
	return {
		type: "menu",
		props: {title, items},
	};
}

// ---------------- STATE BINDING ----------------
function setByPath(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();

  let target = obj;
  for (let key of keys) {
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


// ---------------- SCREEN TREE ----------------
function buildTree(currentState) {
  if (currentState.screen === "main") {
    return [
			textNode("VizNode Bank"),
			menuNode("Main Menu", [
				actionNode("show_balance", "Check Balance"),
				actionNode("open_transfer", "Transfer")
			]),
		];
	}
	
  if (currentState.screen === "balance") {
		return [
			textNode("VizNode Bank"),
			textNode(`Your balance: ${currentState.balance} ₽`),
			menuNode("Actions", [
				actionNode("back", "Back"),
			]),
		];
	}

  if (currentState.screen === "transfer") {
    return [
      textNode("Transfer"),
      menuNode("Transfer Form", [
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
		textNode("Unknown state")
  ];
}


// ---------------- CONSOLE RENDERER ----------------
function renderConsole(tree) {
  console.clear();

  const actionMap = {};
  let index = 1;

  for (const node of tree) {
    if (node.type === "text") {
      console.log(node.props.text);
      console.log("");
      continue;
    }

    if (node.type === "menu") {
      if (node.props.title) {
        console.log(node.props.title);
      }

      for (const item of node.props.items) {
        if (item.type === "action") {
          console.log(`${index}. ${item.props.label}`);
          actionMap[String(index)] = item
          index += 1;
        }

        if (item.type === "input") {
          const shownValue = item.props.value || `[${item.props.placeholder}]`;
          console.log(`${index}. ${item.props.label}: ${shownValue}`);
          actionMap[String(index)] = item
          index += 1;
        }

        if (item.type === "text") {
          console.log(item.props.text);
        }
      }

      console.log("");
    }
  }

  return actionMap;
}


// ---------------- ACTION HANDLERS ----------------
const actionHandlers = {
  show_balance() {
    state.screen = 'balance';
    return true;
  },

  open_transfer() {
    state.screen = 'transfer';
    return true;
  },

  submit_transfer() {
    console.log("\nTransfer submitted:");
    console.log(`Recipient: ${state.transferForm.recipient || "(empty)"}`);
    console.log(`Amount: ${state.transferForm.amount || "(empty)"}`);
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
    const trimmed = value.trim();  
    loop();
  });
}


// ---------------- RUNTIME LOOP ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


rl.on("close", () => {
  console.log("\nBye.");
  process.exit(0);
});


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
          return; // просто повтор
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
      }
    );
}

loop();
