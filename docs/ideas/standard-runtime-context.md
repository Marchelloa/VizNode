# VizNode — стандартный runtime-контекст

## Статус документа

Этот документ описывает направление развития ядра VizNode. Первый минимальный renderer-independent контракт уже реализован через `createApplication(...)`, но окончательный runtime-класс и его API ещё не сформированы.

## Мотивация

Функции прикладной логики могут зависеть от одних и тех же возможностей приложения:

- чтения и изменения `state`;
- уведомления об изменении состояния;
- публикации событий и пользовательских сообщений;
- установки и очистки статуса;
- повторного запуска цикла интерфейса;
- вызова других стандартных механизмов ядра.

При прямой передаче всех зависимостей сигнатура функции становится громоздкой:

```js
submitTransferFlow({
  state,
  setStatus,
  clearStatus,
  notify,
  notifyStateChanged,
  loop,
});
```

Такой список усложняет написание функций логики и связывает их с текущей организацией `app.js`.

## Идея

Создать стандартный runtime-контекст — объект с устойчивым набором возможностей ядра прототипа.

Автор функции логики должен знать не внутреннее устройство приложения, а единый контракт среды выполнения:

```js
async function handler(runtime, payload) {
  // Прикладная логика.
}
```

Независимо от конкретного демонстрационного сценария функция сможет рассчитывать на наличие стандартного API.

## Уже Реализованный Первый Шаг

Прикладная логика вынесена из console entry point в `src/application.js`:

```js
const application = createApplication({
  requestRender,
});
```

Текущий публичный контракт:

```js
application.state;
application.actionHandlers;
application.dispatch(event);
```

Renderer передаёт приложению нормализованные события:

```js
await application.dispatch({
  type: "action",
  intent: "open_transfer",
});
```

или:

```js
await application.dispatch({
  type: "input",
  bind: "transferForm.amount",
  value: "500",
});
```

`requestRender()` является первой стандартизированной возможностью lifecycle. Прикладное ядро может запросить обновление представления, не зная, используется console или DOM.

Текущий `createApplication()` не следует считать окончательной реализацией класса runtime. Это практическая проверка минимального контракта на существующем сценарии.

## Условный публичный API

```js
runtime.state;
runtime.notifyStateChanged(reason);
runtime.setStatus(phase, message);
runtime.clearStatus();
runtime.notify(message);
runtime.runLoop();
```

В дальнейшем контракт может быть уточнён:

```js
runtime.getState();
runtime.updateState(updater, reason);
runtime.emit(eventName, payload);
runtime.render();
runtime.dispatch(intent, payload);
runtime.schedule(callback, delay);
```

Добавлять новые методы следует только при появлении повторяющейся потребности в разных сценариях.

## Возможная форма класса

Название класса пока не является окончательным. Для обсуждения используется `AppRuntime`.

```js
class AppRuntime {
  constructor({
    state,
    observer,
    renderer,
  }) {
    this.state = state;
    this.observer = observer;
    this.renderer = renderer;
  }

  notifyStateChanged(reason) {
    this.observer.notifyStateChanged(this.state, reason);
  }

  notify(message) {
    this.observer.notifyAppEvent("notify", { message });
  }

  setStatus(phase, message) {
    this.state.status.phase = phase;
    this.state.status.message = message;
    this.notifyStateChanged(`status_${phase}`);
  }

  clearStatus() {
    this.setStatus("idle", "");
  }

  runLoop() {
    this.renderer.render(this.state);
  }
}
```

Это только иллюстрация контракта. Реализация не должна менять существующую логику приложения без отдельного решения.

## Использование в функции логики

Прикладная функция получает один стандартный объект вместо набора инфраструктурных аргументов:

```js
async function submitTransferFlow(runtime, services) {
  const form = {
    recipient: runtime.state.transferForm.recipient,
    amount: runtime.state.transferForm.amount,
  };

  const validation = validateTransferForm(form);

  if (!validation.ok) {
    runtime.setStatus("error", validation.reason);
    runtime.notify(validation.reason);
    runtime.runLoop();
    return false;
  }

  runtime.setStatus("sending", "Sending transfer request...");
  runtime.runLoop();

  const response = await services.server.executeTransfer({
    recipient: form.recipient,
    amount: Number(form.amount),
  });

  // Дальнейшая прикладная логика.
}
```

Функция остаётся специфичной для своего сценария, но взаимодействует с ядром через стандартный интерфейс.

## Стандартная сигнатура обработчиков

В перспективе обработчики действий могут использовать общий контракт:

```js
async function handler(runtime, payload) {
  // Обработка действия.
}
```

Например:

```js
const actionHandlers = {
  show_balance(runtime) {
    runtime.state.screen = "balance";
    runtime.notifyStateChanged("show_balance");
  },

  open_transfer(runtime) {
    runtime.state.screen = "transfer";
    runtime.notifyStateChanged("open_transfer");
  },

  submit_transfer(runtime) {
    return submitTransferFlow(runtime, services);
  },

  back(runtime) {
    runtime.state.screen = "main";
    runtime.notifyStateChanged("back");
  },
};
```

Диспетчер передаёт обработчику стандартный runtime:

```js
async function handleAction(intent, payload) {
  const handler = actionHandlers[intent];

  if (!handler) {
    return;
  }

  await handler(runtime, payload);
}
```

Текущий `actionHandlers` уже находится в `application.js` и используется через общий `application.dispatch(event)`. Переход к будущей сигнатуре `handler(runtime, payload)` пока не выполнен и не требуется до появления подтверждённой потребности.

## Граница ответственности

### Runtime-контекст

Runtime должен предоставлять общие возможности ядра:

- доступ к состоянию;
- контролируемое изменение состояния;
- события и уведомления;
- статус интерфейса;
- управление жизненным циклом отображения;
- диспетчеризацию стандартных действий, если она войдёт в контракт.

### Прикладная логика

Прикладные функции отвечают за конкретные сценарии:

- перевод;
- авторизацию;
- работу с заказами;
- управление профилем;
- другие предметные операции.

Предметные методы не должны становиться частью ядра:

```js
runtime.executeTransfer();
runtime.createOrder();
runtime.updateProfile();
```

Иначе runtime потеряет универсальность и начнёт зависеть от конкретного примера.

## Предметные сервисы

Сервисы конкретного сценария можно передавать отдельно:

```js
async function submitTransferFlow(runtime, { server }) {
  const response = await server.executeTransfer(...);
}
```

Так зависимости остаются явными:

- `runtime` предоставляет стандартные возможности VizNode;
- `services` предоставляет предметные возможности приложения.

Альтернативой может быть реестр:

```js
runtime.services.server.executeTransfer(...);
```

Он сокращает количество аргументов, но скрывает реальные зависимости функции. Для прототипа предпочтительнее сначала сохранить предметные сервисы явными.

## Связь с AI-driven DOM-интерфейсом

Runtime-контекст дополняет концепцию AI-driven DOM:

```text
state
  ↓
AI строит описание интерфейса
  ↓
приложение создаёт DOM
  ↓
пользователь выбирает действие
  ↓
intent
  ↓
actionHandlers[intent]
  ↓
handler(runtime, payload)
  ↓
изменение state
  ↓
повторное построение интерфейса
```

ИИ выбирает разрешённый `intent`, а стандартный runtime предоставляет доверенному обработчику возможности для выполнения действия.

## Преимущества

- единый контракт для функций логики;
- меньшая зависимость функций от структуры `app.js`;
- отсутствие длинных списков инфраструктурных аргументов;
- более простое написание новых обработчиков;
- возможность заменить внутреннюю реализацию ядра без изменения всех функций;
- единая точка для стандартизации жизненного цикла приложения;
- более удобное тестирование функций через подменный runtime.

## Риски и ограничения

### God object

Runtime легко превратить в объект, который содержит все возможности приложения. Это повысит связанность и сделает зависимости неявными.

Поэтому его публичный API должен оставаться небольшим и стабильным.

### Service locator

Если поместить в runtime все предметные сервисы, функции начнут получать зависимости через скрытый глобальный реестр.

Следует различать:

- стандартные возможности ядра;
- предметные сервисы конкретного приложения.

### Прямое изменение state

Публичное поле `runtime.state` удобно для прототипа, но позволяет изменить состояние без уведомления наблюдателей.

В будущем может понадобиться более контролируемый API:

```js
runtime.getState();

runtime.updateState((state) => {
  state.screen = "balance";
}, "show_balance");
```

Выбор между прямым доступом и контролируемым обновлением следует сделать после проверки реальных сценариев.

### Неопределённость runLoop

Название `runLoop()` отражает только консольную реализацию и поэтому не было выбрано для общей границы. В первом рабочем варианте используется `requestRender()`.

Возможные будущие варианты:

```js
runtime.render();
runtime.refreshInterface();
runtime.requestRender();
```

`requestRender()` пока остаётся callback, а не методом полноценного runtime. Окончательный lifecycle API следует определять после реализации console и DOM на общей базе.

## Предлагаемый порядок развития

1. Стабилизировать уже введённые `dispatch(event)` и `requestRender()`.
2. Покрыть action/input dispatch тестами.
3. Проверить этот же контракт на DOM renderer.
4. Зафиксировать минимальный список возможностей, реально используемых разными сценариями.
5. Решить, нужен ли отдельный класс runtime или достаточно фабрики приложения.
6. Проверить, не скрывает ли runtime слишком много зависимостей.
7. Уточнять API только на основании практического использования.

## Что пока не входит в задачу

- изменение существующей логики перевода;
- добавление предметных операций в ядро;
- создание универсального DI-контейнера;
- окончательное проектирование API до проверки на практике.

## Критерии жизнеспособности концепции

Концепцию можно считать оправданной, если:

- несколько разных обработчиков используют один и тот же небольшой API;
- функции логики не зависят от внутренней структуры `app.js`;
- runtime не содержит предметных методов;
- зависимости функций остаются понятными;
- изменение внутренней реализации уведомлений или рендеринга не требует переписывать обработчики;
- существующее поведение приложения сохраняется;
- новый обработчик можно написать, опираясь на документированный стандартный набор инструментов.

## Итог

Стандартный runtime-контекст может стать API среды выполнения VizNode:

```text
handler(runtime, payload)
```

Он не должен делать прикладные функции универсальными. Его задача — предоставить им предсказуемый и одинаковый способ взаимодействия с ядром прототипа независимо от конкретного сценария.

Главное архитектурное ограничение: runtime стандартизирует общие возможности VizNode, но не поглощает предметную логику приложения.
