// ---------------- IMPORTS ----------------
import readline from "readline";

import { createApplication } from "./application.js";
import { buildTree } from "./tree.js";
import { renderConsole, print, spacer } from "./console-renderer.js";
import { startBrowserBridge } from "./browser-bridge.js";

import { onStateChange, onAppEvent } from "./observer.js";

import { effectLog, registerEffects } from "./effects.js";


registerEffects({
  onStateChange,
  onAppEvent,
});


// ---------------- READLINE SETUP ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


let currentActionMap = {};
let pendingInputNode = null;


// ---------------- APPLICATION ----------------
const application = createApplication({
  requestRender: loop,
});


// ---------------- SHARED TREE ----------------
/**
 * Строит UI-дерево из актуального состояния приложения.
 *
 * Функция является общей точкой получения текущего представления
 * для подключённых renderer.
 *
 * @returns {Array<object>} актуальные корневые UI-ноды.
 */
function getCurrentTree() {
  return buildTree(application.state);
}

// ---------------- BROWSER BRIDGE ----------------
const browserBridge = startBrowserBridge({
  getCurrentTree,
  dispatchEvent: application.dispatch,
});


// ---------------- CONSOLE EVENT ADAPTERS ----------------
/**
 * Запрашивает значение input-ноды и отправляет приложению
 * унифицированное input-событие.
 *
 * @param {{props: {label: string, bind: string}}} inputNode
 * @returns {void}
 */
function handleInputEdit(inputNode) {
  pendingInputNode = inputNode;
  rl.setPrompt(`${inputNode.props.label}: `);
  rl.prompt();
}


/**
 * Преобразует выбранную action-ноду в унифицированное событие приложения.
 *
 * @param {{props: {intent: string}}} actionNode
 * @returns {Promise<void>}
 */

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

/**
 * Обрабатывает одну строку пользовательского ввода Console.
 *
 * @param {string} input
 * @returns {Promise<void>}
 */
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


// ---------------- CLOSE HANDLER ----------------
/**
 * Завершает приложение и печатает накопленный журнал эффектов.
 *
 * @returns {never}
 */
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


// ---------------- MAIN LOOP ----------------
/**
 * Рендерит актуальное UI-дерево и ожидает следующее действие пользователя.
 *
 * @returns {void}
 */
function loop() {
  const tree = getCurrentTree();

  currentActionMap = renderConsole(tree);
  browserBridge.publishTree(tree);

  if (application.state.status.phase === "sending") {
    return;
  }

  pendingInputNode = null;
  rl.setPrompt("> ");
  rl.prompt();
}
// ---------------- APP START ----------------
loop();
