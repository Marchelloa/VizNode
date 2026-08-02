# VizNode Project Map

## Зачем Этот Файл

Этот документ нужен для быстрого восстановления контекста проекта: что уже реализовано, где находится логика и как проходит основной flow.

## Коротко О Проекте

VizNode — прототип интерфейса с единой прикладной базой и заменяемым представлением.

Сейчас реализован консольный интерфейс. Целевая модель предполагает, что console и DOM:

- строятся из одного `state` и одного формата UI-дерева;
- создают одинаковые события action/input;
- вызывают один `application.dispatch(event)`;
- используют единственный реестр `actionHandlers`;
- не дублируют прикладную или серверную логику.

## Главная Ментальная Модель

```text
state
  ↓
buildTree(state)
  ↓
UI-дерево
  ↓
renderer
  ↓
унифицированное событие
  ↓
application.dispatch(event)
  ↓
actionHandlers / input update
  ↓
state
  ↓
requestRender()
```

Сейчас в качестве renderer используется консоль. DOM renderer и AI-построитель дерева ещё не реализованы.

## Кто За Что Отвечает

### `src/app.js`

Консольная точка входа и адаптер среды.

Здесь находятся:

- настройка `readline`;
- запуск effects;
- создание общего приложения;
- построение и консольный рендер текущего дерева;
- преобразование console input в унифицированные события;
- завершение процесса и печать effect log.

`app.js` не содержит прикладной сценарий перевода и не выбирает обработчик по `intent` самостоятельно.

### `src/application.js`

Общее прикладное ядро, независимое от способа отображения.

Содержит:

- единственный `actionHandlers`;
- `dispatch(event)` для action/input;
- `submitTransferFlow()`;
- клиентскую валидацию формы;
- управление статусом;
- пользовательские уведомления;
- изменение связанных со state input-полей;
- экземпляр demo-сервера;
- вызов renderer-neutral callback `requestRender()`.

Публичный контракт создаваемого приложения:

```js
const application = createApplication({
  requestRender,
});

application.state;
application.actionHandlers;
application.dispatch(event);
```

### `src/state.js`

Хранит клиентское состояние:

- `screen`;
- `balance`;
- `transferForm`;
- `status`.

Также предоставляет `setByPath(...)` для обновления поля по разрешённому пути.

### `src/tree.js`

Детерминированно строит UI-дерево из текущего `state`.

Функция не рендерит интерфейс и не изменяет состояние.

### `src/nodes.js`

Содержит фабрики текущих типов нод:

- `textNode`;
- `actionNode`;
- `inputNode`;
- `menuNode`;
- `containerNode`.

Корень дерева сейчас является массивом нод.

### `src/renderer.js`

Рендерит общее дерево в консоль и возвращает `actionMap`, связывающий номер пункта с action/input-нодой.

Renderer не изменяет `state` и не выполняет `actionHandlers`.

### `src/server.js`

Эмулирует backend:

- выполняет `executeTransfer(...)`;
- проверяет бизнес-ограничения;
- хранит серверный баланс;
- возвращает `ok/error` и новый баланс.

### `src/observer.js`

Предоставляет два канала:

- изменения `state`;
- события приложения.

Основные функции:

- `notifyStateChanged(...)`;
- `notifyAppEvent(...)`.

### `src/effects.js`

Регистрирует наблюдателей и ведёт демонстрационный журнал:

- `[STATE] ...`;
- `[EVENT] ...`;
- `[NOTICE] ...`;
- demo server logs.

## Унифицированные События

Console adapter передаёт приложению action:

```js
{
  type: "action",
  intent: "open_transfer",
}
```

Input передаётся в том же стиле:

```js
{
  type: "input",
  bind: "transferForm.amount",
  value: "500",
}
```

Будущий DOM renderer должен формировать события с тем же контрактом.

## Основной Flow Перевода

1. `app.js` рендерит дерево текущего состояния.
2. Пользователь выбирает action или input.
3. Console adapter создаёт нормализованное событие.
4. `application.dispatch(event)` принимает событие.
5. Action-событие направляется в `actionHandlers[intent]`.
6. Input-событие обновляет поле через `setByPath(...)`.
7. `submit_transfer` запускает `submitTransferFlow()`.
8. Flow валидирует форму, меняет статус и вызывает demo-сервер.
9. После ответа обновляются клиентский `state` и события наблюдателей.
10. `requestRender()` возвращает управление активному представлению.

## Жизненный Цикл Отображения

`application.js` не импортирует console или DOM renderer. Вместо этого при создании получает callback:

```js
const application = createApplication({
  requestRender: loop,
});
```

Для консоли `requestRender` указывает на `loop()`. В будущем DOM-точка входа сможет передать собственную функцию рендера.

Текущий консольный lifecycle требует внимания: повторный `requestRender()` не должен создавать несколько конкурирующих `rl.question(...)`. Это отдельная задача стабилизации общего render lifecycle.

## Что Уже Реализовано Для Общей Базы

- прикладная логика отделена от консольной точки входа;
- создан единый `actionHandlers`;
- создан `application.dispatch(event)`;
- action/input представлены унифицированными событиями;
- console adapter работает через общий dispatch;
- `requestRender` не зависит от конкретного renderer;
- текущий формат UI-дерева сохранён.

## Что Ещё Не Реализовано

- строгий валидатор UI-дерева;
- `InterfaceBuilder` и заменяемые providers;
- DOM renderer и browser entry point;
- AI provider;
- allowlist для `intent` и `bind` на границе AI;
- безопасный fallback на статическое дерево;
- окончательный стандартный runtime API.

## Ближайший Практичный План

1. Стабилизировать lifecycle `requestRender()` в консоли.
2. Добавить тесты `application.dispatch(event)`.
3. Зафиксировать и валидировать текущую схему UI-дерева.
4. Добавить `InterfaceBuilder` со статическим provider на основе `buildTree`.
5. Реализовать DOM renderer и browser entry point.
6. Подключить AI provider к тому же контракту дерева.

## Быстрый Возврат В Контекст

После паузы читать проект лучше в таком порядке:

1. `README.md`;
2. `docs/project-map.md`;
3. `src/application.js`;
4. `src/app.js`;
5. `src/state.js`;
6. `src/tree.js`;
7. `src/nodes.js`;
8. `src/renderer.js`;
9. `src/server.js`;
10. `src/observer.js`;
11. `src/effects.js`.
