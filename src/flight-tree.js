import { textNode, actionNode, menuNode, containerNode } from "./nodes.js";

export function buildFlightTree(currentState) {
    const model = currentState.models.find(
        (item) => item.id === currentState.selectedModelId,
    );
    const battery = currentState.batteries.find(
        (item) => item.id === currentState.selectedBatteryId,
    );

    return [
        textNode("Журнал полётов"),
        containerNode("Модель", [
            actionNode("toggle_model", model
                ? `${model.name} · Вылеты: ${model.flights}`
                : "Выбрать модель"),
            ...(currentState.expandedField === "model"
                ? [menuNode("Выбор модели", currentState.models.map((item) =>
                    actionNode(`select_${item.id}`, `${item.name} · Вылеты: ${item.flights}`),
                ))]
                : []),
        ]),
        containerNode("Батарея", [
            actionNode("toggle_battery", battery
                ? `${battery.name} · Циклы: ${battery.cycles}`
                : "Выбрать батарею"),
            ...(currentState.expandedField === "battery"
                ? [menuNode("Выбор батареи", currentState.batteries.map((item) =>
                    actionNode(`select_${item.id}`, `${item.name} · Циклы: ${item.cycles}`),
                ))]
                : []),
        ]),
        containerNode("Следующий полёт", [
            ...(model && battery
                ? [actionNode("record_flight", "Записать полёт")]
                : [textNode("Выберите модель и батарею")]),
        ]),
    ];
}
