export function createServer() {
    let balance = 12500;

    return {
        async executeTransfer({ recipient, amount }) {
            if (!recipient) {
                return { ok: false, reason: "Recipient not found" };
            }

            if (amount > balance) {
                return { ok: false, reason: "Insufficient funds"};
            }

            balance -= amount;

            return {
                ok: true,
                data: {
                    balance,
                },
            };
        }
    };
} 