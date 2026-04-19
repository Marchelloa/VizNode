import readline from "readline";


// ---------------- STATE ----------------
const state = {
  screen: "main",
  balance: 12500,
  transferForm: {
    recipient: "",
    amount: "",
  },
};

// ---------- NODE FACTORIES -----------
function textNode(text) {
	return {
		type: "text",
		props: {text},
	};
}

function actionNode(id, label) {
	return {
		type: "action",
		props: {id, label},
	};
}

function inputNode(id, label, value = "", placeholder = "") {
  return {
    type: "input", 
    props: {id, label, value, placeholder},
  };
}

function menuNode(title, items = []) {
	return {
		type: "menu",
		props: {title, items},
	};
}




// ---------------- BUILD TREE ----------------
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
          currentState.transferForm.recipient,
          "Enter recipient name"
        ),
        inputNode(
          "amount",
          "Amount",
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

// ---------------- RENDER CONSOLE ----------------
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
          actionMap[String(index)] = {
            type: "action",
            id: item.props.id,
          };
          index += 1;
        }

        if (item.type === "input") {
          const shownValue = item.props.value || `[${item.props.placeholder}]`;
          console.log(`${index}. ${item.props.label}: ${shownValue}`);
          actionMap[String(index)] = {
            type: "input",
            id: item.props.id,
          };
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


// ---------------- HANDLE ACTION ----------------
function handleAction(actionId) {
  switch (actionId) {
		case "show_balance":
    	state.screen = "balance";
    	return true;
		
    case "open_transfer":
    	state.screen = "transfer";
    	return true;
    
    case "submit_transfer":
      console.log("\nTransfer submitted:");
      console.log(`Recipient: ${state.transferForm.recipient || "(empty)"}`);
      console.log(`Amount: ${state.transferForm.amount || "(empty)"}`);

      state.transferForm.recipient = "";
      state.transferForm.amount = "";
      state.screen = "main";
    
      setTimeout(loop, 1200);
      return false;

		case "back":
    	state.screen = "main";
  		return true;
		
    default:
			return true;
	}
}

function handleInputEdit(inputId) {
  if (inputId === "recipient") {
    rl.question("Recipient: ", (value) => {
      state.transferForm.recipient = value.trim();
      loop();
    });
    return;
  }

  if (inputId === "amount") {
    rl.question("Amount: ", (value) => {
      state.transferForm.amount = value.trim();
      loop();
    });
    return;
  }
  
  loop();
}


// ---------------- LOOP ----------------
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
          handleInputEdit(target.id);
          return;
        }

        if (target.type === "action") {
          const shouldContinue = handleAction(target.id);
          if (shouldContinue) {
            loop();
          }
          return;
        }
      }
    );
}

loop();