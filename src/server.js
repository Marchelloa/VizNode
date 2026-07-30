/**
 * Создаёт изолированную эмуляцию сервера с собственным балансом.
 *
 * Серверный баланс является источником истины, а клиент обновляет свою копию
 * только после успешного ответа `executeTransfer()`.
 *
 * @returns {{executeTransfer: Function}} серверный API прототипа.
 */
export function createServer() {
    let balance = 12500;

    return {
        /**
         * Проверяет бизнес-ограничения и выполняет перевод после искусственной задержки.
         *
         * @param {object} transfer — параметры перевода.
         * @param {string} transfer.recipient — получатель.
         * @param {number} transfer.amount — сумма перевода.
         * @returns {Promise<{ok: true, data: {balance: number}} | {ok: false, reason: string}>}
         * результат операции и новый баланс либо причина отказа.
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
