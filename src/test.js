import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function loop() {
  while (true) {
    const tree = buildTree(state);
    const actionMap = renderConsole(tree);

    const input = await ask("> ");
    const trimmed = input.trim();

    if (trimmed === "q" || trimmed === "quit" || trimmed === "exit") {
      rl.close();
      break;
    }

    const actionId = actionMap[trimmed];

    if (!actionId) {
      console.log("\nInvalid input. Try again.");
      continue;
    }

    handleAction(actionId);
  }
}