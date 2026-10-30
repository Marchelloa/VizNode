import readline from "readline";

import { createApplication } from "./application.js";
import { RuntimePhase } from "./runtime.js";
import { appDefinition } from "./app-definition.js";
import { buildTree } from "./tree.js";
// import { flightAppDefinition as appDefinition } from "./flight-app-definition.js";
// import { buildFlightTree as buildTree } from "./flight-tree.js";

import { renderConsole, print, spacer } from "./console-renderer.js";
import { startBrowserBridge } from "./browser-bridge.js";

import { onStateChange, onAppEvent } from "./observer.js";

import { effectLog, registerEffects } from "./effects.js";

registerEffects({
  onStateChange,
  onAppEvent,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentActionMap = {};
let pendingInputNode = null;

const application = createApplication({
  ...appDefinition,
  requestRender: loop,
});

/** Общий источник дерева для Console и DOM. */
function getCurrentTree() {
  return buildTree(application.state);
}

const browserBridge = startBrowserBridge({
  getCurrentTree,
  dispatchEvent: application.dispatch,
});

/** Только запрашивает ввод; событие отправится после получения строки. */
function handleInputEdit(inputNode) {
  pendingInputNode = inputNode;
  rl.setPrompt(`${inputNode.props.label}: `);
  rl.prompt();
}

async function handleAction(actionNode) {
  const handled = await application.dispatch({
    type: "action",
    intent: actionNode.props.intent,
  });

  if (!handled) {
    console.log("\nAction event was rejected.");
    setTimeout(loop, 1000);
  }
}

async function handleConsoleLine(input) {
  const trimmed = input.trim();

  if (pendingInputNode) {
    const inputNode = pendingInputNode;
    pendingInputNode = null;

    const handled = await application.dispatch({
      type: "input",
      bind: inputNode.props.bind,
      value: trimmed,
    });

    if (!handled) {
      console.log("\nInput event was rejected.");
      setTimeout(loop, 1000);
    }

    return;
  }

  if (
    trimmed === "q" ||
    trimmed === "quit" ||
    trimmed === "exit"
  ) {
    rl.close();
    return;
  }

  const target = currentActionMap[trimmed];

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
    await handleAction(target);
  }
}

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

rl.on("line", handleConsoleLine);
rl.on("close", handleClose);

function loop() {
  const tree = getCurrentTree();

  currentActionMap = renderConsole(tree);
  browserBridge.publishTree(tree);

  if (application.runtime.phase === RuntimePhase.PENDING) {
    return;
  }

  pendingInputNode = null;
  rl.setPrompt("> ");
  rl.prompt();
}
loop();
