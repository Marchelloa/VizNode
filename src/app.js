// ---------------- IMPORTS ----------------
import readline from "readline";

import { createApplication } from "./application.js";
import { buildTree } from "./tree.js";
import { renderConsole, print, spacer } from "./console-renderer.js";

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


// ---------------- APPLICATION ----------------
const application = createApplication({
  requestRender: loop,
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
  rl.question(`${inputNode.props.label}: `, async (value) => {
    const handled = await application.dispatch({
      type: "input",
      bind: inputNode.props.bind,
      value: value.trim(),
    });

    if (!handled) {
      console.log("\nInput event was rejected.");
      setTimeout(loop, 1000);
    }
  });
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

rl.on("close", handleClose);


// ---------------- MAIN LOOP ----------------
/**
 * Рендерит актуальное UI-дерево и ожидает следующее действие пользователя.
 *
 * @returns {void}
 */
function loop() {
  const tree = buildTree(application.state);
  const actionMap = renderConsole(tree);

  if (application.state.status.phase === "sending") {
    return;
  }

  rl.question("> ", (input) => {
    const trimmed = input.trim();

    if (
      trimmed === "q" ||
      trimmed === "quit" ||
      trimmed === "exit"
    ) {
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
      void handleAction(target);
      return;
    }
  });
}


// ---------------- APP START ----------------
loop();
