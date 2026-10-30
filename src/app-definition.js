import { state } from "./state.js"
import { createServer } from "./server.js";
import { RuntimePhase } from "./runtime.js";

// ctx создаётся в createApplication и передаётся обработчикам; операции получают его явно.
// Поля: state, operations, services, runtime, requestRender, notifyStateChanged, notifyAppEvent.

/**
 * Описание приложения для createApplication.
 * actions связывает intent с обработчиками; operations содержит внутреннюю логику.
 * state используется без копирования; services содержит подготовленные зависимости.
 */
export const appDefinition = {
    state,

    /** Внешние зависимости приложения; здесь сервер заменён эмулятором. */
    services: {
        server: createServer(),
    },

    /** Обработчики интерфейса; ключ — intent из дерева. */
    actions: {

        show_balance(ctx) {
            ctx.state.screen = "balance";
            ctx.notifyStateChanged(ctx.state, "show_balance");
            ctx.requestRender();
        },

        open_transfer(ctx) {
            ctx.state.screen ="transfer";
            ctx.notifyStateChanged(ctx.state, "open_transfer");
            ctx.requestRender();
        },

        /** Запускает перевод без ожидания его завершения. */
        submit_transfer(ctx) {
            ctx.notifyAppEvent("submit_transfer", {
                recipient: ctx.state.transferForm.recipient,
                amount: ctx.state.transferForm.amount,
            });

            void ctx.operations.submitTransferFlow(ctx);
        },

        back(ctx) {
            ctx.state.screen = "main";
            ctx.notifyStateChanged(ctx.state, "back");
            ctx.requestRender();
        },
    },

    /** Вспомогательные функции приложения. */
    operations: {
        /**
         * Проверка формы на клиенте; бизнес-ограничения проверяет сервер.
         * @param {{recipient: string, amount: string}} form
         * @returns {{ok: true} | {ok: false, reason: string}}
         */
        validateTransferForm(form) {
            if (!form.recipient.trim()) {
                return { ok: false, reason: "Recipient is required" };
            }

            if (!form.amount.trim()) {
                return { ok: false, reason: "Amount is required"}
            }

            const amount = Number(form.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                return { ok: false, reason: "Amount must be a positive number" };
            }

            return { ok: true };
        },

        notify(ctx, reason) {
            ctx.notifyAppEvent("notify", { message: reason });
        },

        /** Уведомляет наблюдателей, но не вызывает render. */
        setStatus(ctx, phase, message) {
            ctx.runtime.phase = phase;
            ctx.state.message = message;
            // Сохраняем прежнее имя события демо при общей фазе PENDING.
            const reason = phase === RuntimePhase.PENDING ? "sending" : phase;
            ctx.notifyStateChanged(ctx.state, `status_${reason}`);
        },

        /** Уведомляет наблюдателей, но не вызывает render. */
        clearStatus(ctx) {
            ctx.runtime.phase = RuntimePhase.IDLE;
            ctx.state.message = "";
            ctx.notifyStateChanged(ctx.state, "status_cleared");

        },

        /** Управляет уведомлениями и render; Promise не ожидает отложенный сброс статуса. */
        async submitTransferFlow(ctx) {
            const form = {
                recipient: ctx.state.transferForm.recipient,
                amount: ctx.state.transferForm.amount,
            };

            const validation = ctx.operations.validateTransferForm(form);

            if (!validation.ok) {
                ctx.operations.setStatus(ctx, RuntimePhase.ERROR, validation.reason);
                ctx.operations.notify(ctx, validation.reason);
                setTimeout(ctx.requestRender, 1200);
                return;
            }

            ctx.operations.setStatus(ctx, RuntimePhase.PENDING, "Sending transfer request...");
            ctx.requestRender();

            const response = await ctx.services.server.executeTransfer({
                recipient: form.recipient,
                amount: Number(form.amount),
            });

            if (!response.ok) {
                ctx.operations.setStatus(ctx, RuntimePhase.ERROR, response.reason);
                ctx.operations.notify(ctx, response.reason);
                ctx.requestRender();
                return;
            }

            ctx.state.balance = response.data.balance;
            ctx.state.transferForm.recipient = "";
            ctx.state.transferForm.amount = "";
            ctx.state.screen = "main";

            ctx.operations.setStatus(
                ctx,
                RuntimePhase.SUCCESS,
                `Transfer completed. New balance: ${response.data.balance}`,
            );
            ctx.notifyStateChanged(ctx.state, "transfer_applied");

            ctx.operations.notify(ctx, "Transfer completed");
            ctx.requestRender();

            setTimeout(() => {
                ctx.operations.clearStatus(ctx);
                ctx.requestRender();
            }, 1800);
        },
    },
};
