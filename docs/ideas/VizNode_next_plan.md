# VizNode — ближайший план реализации (обновлённый)

## Текущее состояние (выполнено)

Реализовано:

- `state` как источник правды
- UI-узлы:
  - textNode
  - actionNode
  - inputNode
  - menuNode
  - containerNode
- Рекурсивный renderer
- Разделение menu и container
- Утилиты print() и spacer()
- State observer:
  - onStateChange
  - notifyStateChanged
- snapshot через structuredClone
- demo server handler (serverTransferHandler)
- связка:
  submit_transfer → notify → handler

---

## Текущая цель

Расширить систему событий:

action/input → state change → notify(reason) → effects

---

## Milestone — Расширение событий

Добавить notifyStateChanged(reason) для всех значимых действий:

События:

- open_transfer
- show_balance
- back
- input_changed
- submit_transfer (уже есть)

---

## Где вызывать notify

Переходы экранов:

open_transfer() {
  state.screen = "transfer";
  notifyStateChanged("open_transfer");
  return true;
}

Изменение input:

setByPath(state, bind, value);
notifyStateChanged("input_changed");

submit_transfer (ВАЖНО — ДО очистки):

submit_transfer() {
  notifyStateChanged("submit_transfer");

  state.transferForm.recipient = "";
  state.transferForm.amount = "";
  state.screen = "main";
}

---

## Добавить простой логгер

onStateChange((snapshot, reason) => {
  print(`[STATE] ${reason}`);
});

---

## Архитектурное правило

state — источник правды  
observer — наблюдает  
effects — реагируют  

---

## Что НЕ делать

Пока не добавлять:

- HTTP сервер
- WebSocket
- БД
- immutable state
- перенос логики на сервер

---

## Следующий этап

После покрытия событий:

1. JSON persistence
2. HTML snapshot renderer
3. WebSocket (опционально)

---

## Критерий завершения

- Все действия вызывают notify
- reason корректно передаётся
- observer реагирует
- state остаётся главным источником

---

## Ключевая формула

state is not controlled;  
state is observed.
