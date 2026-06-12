// ---------------- EFFECT LOG -------------------------
const effectLog = [];

function logEffect(message) {
  effectLog.push(message);
}

// ---------------- DEMO SERVER HANDLERS ----------------
function serverTransferHandler(data) {
  logEffect("[SERVER] Transfer handler called");
  logEffect(`[SERVER] Recipient: ${data.recipient}`);
  logEffect(`[SERVER] Amount: ${data.amount}`);
}

function registerEffects({ onStateChange, onAppEvent }) {
  onStateChange((snapshot, reason) => {
    logEffect(`[STATE] ${reason}`);
  });

  onAppEvent((eventName, payload) => {
    if (eventName === "notify") {
      logEffect(`[NOTICE] ${payload.message}`);
      return;
    }

    logEffect(`[EVENT] ${eventName}`);
  });

  onAppEvent((eventName, payload) => {
    if (eventName !== "submit_transfer") {
      return;
    }

    serverTransferHandler({
      recipient: payload.recipient,
      amount: payload.amount,
    });
  });
}

export {
    effectLog,
    registerEffects,
}
