import readline from "readline";


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

function menuNode(title, items = []) {
	return {
		type: "menu",
		props: {title, items},
	};
}


// ---------------- STATE ----------------
const state = {
  screen: "main",
  balance: 12500,
};

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
			textNode("Transfer screen (stub)"),
			menuNode("Actions", [
				actionNode("back", "Back")
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
          actionMap[String(index)] = item.props.id;
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
    	return;
		case "open_transfer":
    	state.screen = "transfer";
    	return;
		case "back":
    	state.screen = "main";
  		return;
		default:
			return;
	}
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

        const actionId = actionMap[trimmed];    

        if (!actionId) {
          console.log("\nInvalid input. Try again.");
          setTimeout(loop, 1000);
          return; // просто повтор
        }   
        handleAction(actionId);
        loop();
        }
    );
}


loop();