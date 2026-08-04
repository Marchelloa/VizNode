# Срез Архитектуры VizNode

## Текущее Состояние

Прототип разделён на прикладное ядро и адаптер текущей среды отображения.

```text
src/app.js
  console input/output
        ↓
normalized event
        ↓
src/application.js
  application.dispatch(event)
        ↓
actionHandlers / input update
        ↓
state
        ↓
requestRender()
```

Консоль остаётся единственным подключённым представлением. DOM renderer уже строит статическое представление общего дерева, но пока не подключён к browser entry point и `application.dispatch(event)`. Прикладная логика не зависит от `readline`, console renderer или DOM API.

## Текущие Модули

### `src/app.js`

Console entry point:

- создаёт `readline`;
- регистрирует effects;
- создаёт приложение через `createApplication(...)`;
- строит дерево из `application.state`;
- вызывает `renderConsole(tree)`;
- преобразует console selection в action/input-события;
- передаёт события в `application.dispatch(event)`.

### `src/application.js`

Renderer-independent application core:

- хранит единственный `actionHandlers`;
- диспетчеризует нормализованные события;
- выполняет сценарий перевода;
- валидирует форму на стороне клиента;
- управляет status и notices;
- обращается к demo-серверу;
- изменяет общий `state`;
- запрашивает повторное отображение через `requestRender()`.

### `src/tree.js`

Строит декларативное UI-дерево из текущего `state`. Не выполняет рендеринг и прикладные действия.

### `src/nodes.js`

Определяет фабрики текущих UI-нод:

- `text`;
- `action`;
- `input`;
- `menu`;
- `container`.

### `src/console-renderer.js`

Консольный renderer:

- отображает общее дерево;
- рекурсивно обходит составные ноды;
- формирует `actionMap` для console adapter;
- не вызывает прикладные обработчики.

### `src/dom-renderer.js`

DOM renderer:

- преобразует `text`, `action`, `input`, `menu` и `container` в DOM;
- рекурсивно обходит составные ноды;
- сохраняет `intent` и `bind` в `data-*` атрибутах;
- использует `textContent` для текстовых значений;
- пока не формирует события и не вызывает прикладные обработчики.

### `src/state.js`

Содержит общий клиентский `state` и helper `setByPath(...)`.

### `src/observer.js`

Предоставляет каналы state changes и app events.

### `src/effects.js`

Подписывается на каналы observer и ведёт демонстрационный effect log.

### `src/server.js`

Эмулирует backend и хранит серверный баланс как источник истины.

## Основные Архитектурные Границы

### Прикладное Ядро Не Знает Renderer

`application.js` не импортирует:

- `readline`;
- `console-renderer.js`;
- `dom-renderer.js`;
- DOM API;
- browser entry point.

Для обновления представления ядро использует абстрактный callback:

```js
const application = createApplication({
  requestRender,
});
```

Текущая консоль передаёт `loop`. Будущий DOM entry point сможет передать функцию DOM-рендера.

### Renderer Не Знает Прикладные Обработчики

Console adapter не выполняет:

```js
actionHandlers[intent]();
```

Он создаёт событие:

```js
{
  type: "action",
  intent,
}
```

и передаёт его приложению:

```js
await application.dispatch(event);
```

### Один Реестр Действий

`actionHandlers` находится в `application.js` и является общей доверенной базой поведения для любых представлений.

В будущем разрешённые AI-намерения можно получать из этого же реестра:

```js
Object.keys(application.actionHandlers);
```

### Один Формат Input

Консоль передаёт значение как нормализованное событие:

```js
{
  type: "input",
  bind: "transferForm.amount",
  value: "500",
}
```

При подключении событий DOM renderer должен использовать тот же контракт.

## Текущий Application API

```js
const application = createApplication({
  requestRender,
});

application.state;
application.actionHandlers;
application.dispatch(event);
```

Это уже первый renderer-independent контракт ядра, но ещё не окончательный runtime-класс.

## Клиентская И Серверная Стороны

### Клиентская сторона

- принимает нормализованные события;
- валидирует форму;
- вызывает сервер;
- обновляет клиентский `state`;
- публикует state/app events;
- запрашивает повторное отображение.

### Серверная сторона

- проверяет бизнес-ограничения;
- изменяет серверный баланс;
- возвращает результат операции и новый баланс.

Баланс существует в двух местах осознанно:

- серверный баланс — источник истины;
- клиентский баланс — отображаемая копия из ответа сервера.

## Что Улучшилось

- `app.js` стал console adapter вместо монолитного orchestration-файла;
- прикладная логика больше не зависит от `readline`;
- `true/false` больше не управляют консольным циклом из action handlers;
- console action/input используют общий event contract;
- создана реальная граница для подключения DOM;
- создана база для подключения AI builder без дублирования поведения.

## Известное Давление

### Lifecycle Повторного Рендера

`requestRender()` является правильной нейтральной границей, но текущий console loop может создать конкурирующие `rl.question(...)`, если повторный render запрошен до завершения предыдущего ожидания ввода.

Перед развитием DOM/AI-контура lifecycle нужно стабилизировать или формализовать.

### Валидация Внешнего Дерева

Текущее дерево создаётся доверенной функцией `buildTree(state)`. Перед подключением AI потребуется строгая структурная и семантическая проверка:

- разрешённые node types;
- обязательные props;
- разрешённые `intent`;
- разрешённые `bind`;
- корректные дочерние коллекции.

### Runtime-Контекст

`createApplication({ requestRender })` уже проверяет часть идеи стандартного runtime-контекста, но пока не следует расширять его API без повторяющихся практических потребностей.

## Следующий Архитектурный Шаг

Рекомендуемый порядок:

1. стабилизировать console render lifecycle;
2. покрыть `application.dispatch(event)` тестами;
3. зафиксировать validator текущего дерева;
4. добавить `InterfaceBuilder` со статическим provider;
5. подключить события и browser entry point к DOM renderer;
6. подключить AI provider к тому же дереву и allowlist.

## Рабочее Правило

Новые представления не должны менять прикладное поведение:

```text
ConsoleRenderer ─┐
                 ├→ application.dispatch(event) → state
DOMRenderer ─────┘
```

Если для подключения renderer требуется собственный `actionHandlers` или отдельная логика перевода, граница выбрана неправильно.
