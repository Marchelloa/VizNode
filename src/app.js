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
  /**
   * Открывает экран с текущим балансом.
   *
   * @returns {boolean} `true`, чтобы основной цикл продолжил работу.
   */
  show_balance() {
    state.screen = "balance";
    notifyStateChanged(state, "show_balance");
    return true;
  },
  
  /**
   * Открывает экран формы перевода.
   *
   * @returns {boolean} `true`, чтобы основной цикл продолжил работу.
   */
  open_transfer() {
    state.screen = "transfer";
    notifyStateChanged(state, "open_transfer");
    return true;
  },
  
  /**
   * Публикует событие отправки и запускает асинхронный flow перевода.
   *
   * @returns {boolean} `false`, потому что продолжением цикла управляет flow перевода.
   */
  submit_transfer() {
    notifyAppEvent("submit_transfer", {
      recipient: state.transferForm.recipient,
      amount: state.transferForm.amount,
    });

    submitTransferFlow();
    return false;
  },

  /**
   * Возвращает пользователя на главный экран.
   *
   * @returns {boolean} `true`, чтобы основной цикл продолжил работу.
   */
  back() {
    state.screen = "main";
    notifyStateChanged(state, "back");
    return true;
  },
};


const server = createServer();

// ---------------- NOTIFY ----------------
/**
 * Отправляет пользовательское уведомление через канал событий приложения.
 *
 * @param {string} reason — сообщение о результате операции или возникшей проблеме.
 * @returns {void}
 */
function notify(reason) {
  notifyAppEvent("notify", { message: reason });
}

/**
 * Обновляет текущий статус интерфейса и уведомляет наблюдателей состояния.
 *
 * @param {"idle" | "sending" | "success" | "error"} phase — текущая фаза операции.
 * @param {string} message — сообщение, отображаемое пользователю.
 * @returns {void}
 */
function setStatus(phase, message) {
  state.status.phase = phase;
  state.status.message = message;
  notifyStateChanged(state, `status_${phase}`);
}

/**
 * Сбрасывает статус интерфейса в исходное состояние и уведомляет наблюдателей.
 *
 * @returns {void}
 */
function clearStatus() {
  state.status.phase = "idle";
  state.status.message = "";
  notifyStateChanged(state, "status_cleared");
}

// ---------------- LOCAL VALIDATION ----------------
/**
 * Проверяет данные формы перед отправкой на сервер.
 *
 * Проверка относится только к требованиям клиентской формы. Бизнес-ограничения,
 * например достаточность баланса, остаются ответственностью сервера.
 *
 * @param {{recipient: string, amount: string}} form — данные формы перевода.
 * @returns {{ok: true} | {ok: false, reason: string}} результат проверки.
 */
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


/**
 * Выполняет полный клиентский сценарий перевода.
 *
 * Функция валидирует форму, показывает статус отправки, вызывает сервер,
 * синхронизирует клиентский баланс и сообщает пользователю результат.
 * Повторным запуском основного цикла функция управляет самостоятельно.
 *
 * @returns {Promise<boolean>} промис со значением `false`, указывающим,
 * что внешний обработчик не должен повторно запускать основной цикл.
 */
async function submitTransferFlow() {
  const form = {
    recipient: state.transferForm.recipient,
    amount: state.transferForm.amount,
  };

  const validation = validateTransferForm(form);
  if (!validation.ok) {
    setStatus("error", validation.reason);
    notify(validation.reason);
    setTimeout(loop, 1200);
    return false;
  }

  setStatus("sending", "Sending transfer request...");
  loop();

  const response = await server.executeTransfer({
    recipient: form.recipient,
    amount: Number(form.amount),
  });

  if (!response.ok) {
    setStatus("error", response.reason);
    notify(response.reason);
    loop();
    return false;
  }

  state.balance = response.data.balance;
  state.transferForm.recipient = "";
  state.transferForm.amount = "";
  state.screen = "main";
  setStatus("success", `Transfer completed. New balance: ${response.data.balance}`);
  notifyStateChanged(state, "transfer_applied");

  notify("Transfer completed");
  loop();
  setTimeout(() => {
    clearStatus();
    loop();
  }, 1800);
  return false;
}

// ---------------- RUNTIME HANDLERS ----------------
/**
 * Находит и вызывает обработчик намерения, связанного с action-нодой.
 *
 * @param {{props: {intent: string}}} actionNode — выбранная action-нода.
 * @returns {boolean} нужно ли немедленно продолжить основной цикл.
 */
function handleAction(actionNode) {
  const intent = actionNode.props.intent;
  const handler = actionHandlers[intent];

  if (!handler) {
    return true;
  }

  return handler();
}

/**
 * Запрашивает новое значение input-ноды и записывает его в связанное поле state.
 *
 * После получения значения функция уведомляет наблюдателей и самостоятельно
 * возобновляет основной цикл. Внешний код не должен вызывать `loop()` параллельно.
 *
 * @param {{props: {label: string, bind: string}}} inputNode — редактируемая input-нода.
 * @returns {void}
 */
function handleInputEdit(inputNode) {
  rl.question(`${inputNode.props.label}: `, (value) => {
    setByPath(state, inputNode.props.bind, value.trim());
    clearStatus();
    notifyStateChanged(state, "input_changed");
    loop();
  });
}


// ---------------- READLINE SETUP ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Завершает приложение и перед выходом печатает накопленный журнал эффектов.
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
 * Во время серверной отправки новый вопрос не создаётся. Обработчики асинхронных
 * операций и input-полей сами решают, когда безопасно возобновить цикл.
 *
 * @returns {void}
 */
function loop() {
  const tree = buildTree(state);
  const actionMap = renderConsole(tree);

  if (state.status.phase === "sending") {
    return;
  }

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
