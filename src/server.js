/** Серверный баланс — источник истины; клиент применяет его после успешного ответа. */
export function createServer() {
    let balance = 12500;

    return {
        /**
         * Проверяет бизнес-ограничения после искусственной задержки.
         * @param {{recipient: string, amount: number}} transfer
         * @returns {Promise<{ok: true, data: {balance: number}} | {ok: false, reason: string}>}
         */
        async executeTransfer({ recipient, amount }) {
            await new Promise((resolve) => {
                setTimeout(resolve, 2500);
            });

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
