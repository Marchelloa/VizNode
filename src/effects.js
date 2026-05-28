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

function registerEffects(onStateChange) {
  onStateChange((snapshot, reason) => {
    logEffect(`[STATE] ${reason}`);
  });

  onStateChange((snapshot, reason) => {
    if (reason !== "submit_transfer") {
      return;
    }

    serverTransferHandler({
      recipient: snapshot.transferForm.recipient,
      amount: snapshot.transferForm.amount,
    });
  });
}

export {
    effectLog,
    logEffect,
    registerEffects,
}
