import { flightState } from "./flight-state.js";

export const flightAppDefinition = {
    state: flightState,

    actions: {
        toggle_model(ctx) {
            ctx.state.expandedField = ctx.state.expandedField === "model" ? null : "model";
            ctx.notifyStateChanged(ctx.state, "model_picker_toggled");
            ctx.requestRender();
        },

        toggle_battery(ctx) {
            ctx.state.expandedField = ctx.state.expandedField === "battery" ? null : "battery";
            ctx.notifyStateChanged(ctx.state, "battery_picker_toggled");
            ctx.requestRender();
        },

        select_model_1(ctx) {
            ctx.state.selectedModelId = "model_1";
            ctx.state.expandedField = null;
            ctx.notifyStateChanged(ctx.state, "model_selected");
            ctx.requestRender();
        },

        select_model_2(ctx) {
            ctx.state.selectedModelId = "model_2";
            ctx.state.expandedField = null;
            ctx.notifyStateChanged(ctx.state, "model_selected");
            ctx.requestRender();
        },

        select_battery_1(ctx) {
            ctx.state.selectedBatteryId = "battery_1";
            ctx.state.expandedField = null;
            ctx.notifyStateChanged(ctx.state, "battery_selected");
            ctx.requestRender();
        },

        select_battery_2(ctx) {
            ctx.state.selectedBatteryId = "battery_2";
            ctx.state.expandedField = null;
            ctx.notifyStateChanged(ctx.state, "battery_selected");
            ctx.requestRender();
        },

        record_flight(ctx) {
            ctx.operations.recordFlight(ctx);
        },
    },

    operations: {
        /** Один полёт добавляет один вылет модели и один цикл батарее. */
        recordFlight(ctx) {
            const model = ctx.state.models.find(
                (item) => item.id === ctx.state.selectedModelId,
            );
            const battery = ctx.state.batteries.find(
                (item) => item.id === ctx.state.selectedBatteryId,
            );

            if (!model || !battery) {
                return;
            }

            model.flights += 1;
            battery.cycles += 1;
            ctx.notifyStateChanged(ctx.state, "flight_recorded");
            ctx.requestRender();
        },
    },
};
