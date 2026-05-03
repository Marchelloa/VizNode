# VizNode — ближайший план реализации

## Цель ближайшего этапа

Сделать минимальный законченный цикл:

```txt
action/input → state change → notify(reason) → effect handler
```

Главная задача — доказать механику наблюдения за состоянием без превращения проекта в обычное клиент-серверное приложение.

---

## Архитектурный принцип

`state` остаётся источником правды внутри консольного приложения.

Серверная/внешняя часть не управляет состоянием, а реагирует на уже произошедшие события.

```txt
console app
  ↓
state changes
  ↓
notify(reason)
  ↓
effects / handlers
```

---

## Что уже есть

- `state` приложения.
- Фабрики UI-узлов:
  - `textNode`
  - `actionNode`
  - `inputNode`
  - `menuNode`
  - `containerNode`
- `buildTree(state)`.
- Рекурсивный console renderer.
- `actionMap` для выбора пунктов.
- Обработка `action` и `input`.
- Разделение `menu` и `container`.
- Утилиты `print()` и `spacer()`.

---

## Milestone 1 — State Observer

Добавить механизм подписки на изменения состояния.

```js
const stateChangeListeners = [];

function onStateChange(listener) {
  stateChangeListeners.push(listener);
}

function notifyStateChanged(reason) {
  const snapshot = structuredClone(state);

  for (const listener of stateChangeListeners) {
    listener(snapshot, reason);
  }
}
```

### Важно

`notifyStateChanged()` не должен менять `state`.
Он только сообщает внешним обработчикам, что что-то уже произошло.

---

## Milestone 2 — Вызовы notify после важных изменений

Добавить `notifyStateChanged(reason)` в места, где реально меняется состояние.

### Примеры событий

```txt
open_transfer
show_balance
back
input_changed
submit_transfer
```

### Где вызывать

После перехода экрана:

```js
open_transfer() {
  state.screen = "transfer";
  notifyStateChanged("open_transfer");
  return true;
}
```

После редактирования input:

```js
setByPath(state, inputNode.props.bind, value.trim());
notifyStateChanged("input_changed");
```

Перед очисткой формы при submit:

```js
submit_transfer() {
  notifyStateChanged("submit_transfer");

  state.transferForm.recipient = "";
  state.transferForm.amount = "";
  state.screen = "main";

  setTimeout(loop, 1200);
  return false;
}
```

---

## Milestone 3 — Демо server/effect handler

Пока не делать настоящий HTTP-сервер.
Сначала добавить локальную имитацию серверного обработчика.

```js
function serverTransferHandler(data) {
  print("\n[SERVER] Transfer handler called");
  print(`[SERVER] Recipient: ${data.recipient}`);
  print(`[SERVER] Amount: ${data.amount}`);
}
```

Подписка:

```js
onStateChange((snapshot, reason) => {
  if (reason !== "submit_transfer") {
    return;
  }

  serverTransferHandler({
    recipient: snapshot.transferForm.recipient,
    amount: snapshot.transferForm.amount,
  });
});
```

---

## Milestone 4 — Разделить события и побочные эффекты

Событие отвечает на вопрос:

```txt
что произошло?
```

Effect handler отвечает на вопрос:

```txt
что с этим делать снаружи?
```

Пример:

```txt
event: submit_transfer
data: recipient, amount
effect: call server transfer handler
```

---

## Что НЕ делать пока

Пока не нужно:

- делать полноценный HTTP API;
- делать WebSocket;
- подключать настоящую базу данных;
- переписывать `state` в immutable/redux-style;
- переносить владение состоянием на сервер;
- превращать проект в обычное веб-приложение.

---

## После первого рабочего цикла

Когда заработает:

```txt
submit_transfer → notifyStateChanged → serverTransferHandler
```

можно будет выбрать следующий шаг:

1. Подключить запись в JSON-файл.
2. Подключить настоящий HTTP endpoint.
3. Подключить HTML snapshot renderer.
4. Подключить WebSocket для live-визуализации.

---

## Критерий готовности ближайшего этапа

Этап считается готовым, если:

- пользователь заполняет transfer form;
- нажимает Submit;
- `state` ещё содержит данные формы в момент события;
- вызывается `notifyStateChanged("submit_transfer")`;
- срабатывает `serverTransferHandler`;
- данные transfer корректно выводятся в консоль;
- после этого форма очищается и экран возвращается на main.

---

## Ключевая формула VizNode

```txt
state is not controlled by the server;
state is observed by effects.
```

Русский вариант:

```txt
сервер не управляет состоянием;
сервер реагирует на состояние и события.
```
