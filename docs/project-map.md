# VizNode — карта проекта

Актуализировано: 29 октября 2026 года по локальному коду и проверкам пользователя.

## Рабочая модель

Одно приложение в Node владеет общим состоянием, обработчиками и построением дерева. Console и одна браузерная вкладка представляют это же приложение. Несколько браузерных вкладок не входят в поддерживаемый сценарий; технический запрет второго подключения пока не реализован.

```text
Console input ─┐
              ├→ application.dispatch(event) → state → buildTree(state)
DOM input ────┘                                         ├→ Console
                                                       └→ SSE → DOM
```

DOM action/input подключены. Браузер получает готовое дерево и не создаёт собственный экземпляр приложения. AI builder пока не реализован.

## Модули

| Файл | Ответственность |
| --- | --- |
| `src/app.js` | Сборка приложения, readline, Console-адаптер, запуск browser bridge, общий render loop и завершение процесса. |
| `src/application.js` | Общий dispatch, создание сервера и ctx; input вызывает переданную operations.clearStatus(ctx). |
| `src/app-definition.js` | Описание приложения: state, createServer, actions и operations. |
| `src/state.js` | Общее состояние банковского примера и запись по существующему пути через setByPath. Allowlist путей пока отсутствует. |
| `src/tree.js` | Чистое построение дерева для экранов main, balance и transfer. |
| `src/nodes.js` | Фабрики text, action, input, menu и container. Корень дерева — массив. |
| `src/console-renderer.js` | Вывод дерева и построение actionMap для Console-адаптера. |
| `src/dom-renderer.js` | Создание DOM, восстановление локального ввода, фокуса и выделения после replaceChildren. |
| `src/browser-demo.js` | SSE, адаптация click/input, очередь HTTP-событий, временные pendingInputs и подтверждение по значениям. |
| `src/browser-bridge.js` | Локальный HTTP/SSE-мост: GET /api/events, POST /api/dispatch, CORS preflight. |
| `src/server.js` | Эмуляция backend перевода с задержкой и собственным балансом. |
| `src/observer.js` | Подписки на изменения состояния и события приложения; доставка снимков через structuredClone. |
| `src/effects.js` | Демонстрационный журнал состояния, событий и уведомлений. |

`index.html` содержит постоянную оболочку и `#app`. `styles.css` содержит самостоятельную светлую лаконичную тему. Старые CSS-пресеты сохранены отдельно. Отдельные `index.bank.html` и `index.terminal.html` — демонстрационные заготовки со своими темами.

## Текущий API

```js
const application = createApplication({ ...appDefinition, requestRender });
application.state;
application.actionHandlers;
await application.dispatch({ type: "action", intent: "open_transfer" });
await application.dispatch({
  type: "input",
  bind: "transferForm.amount",
  value: "500",
});
```

appDefinition импортируется из src/app-definition.js и содержит state, createServer, actions, operations. Фабрика вызывает переданный createServer и создаёт ctx: state, operations, server, requestRender, notifyStateChanged, notifyAppEvent. dispatch передаёт ctx обработчикам; операции получают его явно при необходимости. actionHandlers ссылается на actions. Дерево по-прежнему подключается отдельно в app.js.

Структурный перенос завершён: все локальные прикладные функции удалены, input вызывает operations.clearStatus(ctx). Предметная логика находится в operations; привязка к имени clearStatus остаётся известным ограничением. Универсальный механизм реакций на ввод не вводился.

## Жизненный цикл

`requestRender` вызывает общий `loop()`: дерево строится один раз и передаётся Console и SSE-мосту. Console использует постоянный `rl.on("line", handleConsoleLine)`, а не вложенные `rl.question`. Во время sending loop не выводит новый prompt; это не запрет действий на уровне ядра.

Браузер отправляет события последовательно. HTTP-подтверждение означает принятие события. В случае submit_transfer обработчик запускает flow через void, поэтому dispatch не ожидает завершения перевода. После ответа demo-сервера flow обновляет состояние и запрашивает новый render.

## Статус и дальнейшая работа

Пользователь подтвердил, что основной прототип работает согласно замыслу. Автоматических тестов пока нет: npm test является заглушкой. Проверки задержек и ошибок DOM-ввода не зафиксированы как завершённые.

Основные открытые вопросы: обновление состояния и render как единый контракт; повторный Submit и ошибки async-операций; восстановление после ошибки input; валидация дерева и внешних событий; отделение ядра от банковского примера.

Пользователь подтвердил ручные проверки навигации и ввода Console/DOM, ошибок формы, отказа сервера, успешного перевода, баланса, статусов и таймеров. Повторный Submit сохраняет прежний запуск операции: сравнение с 93b3dd9 подтвердило сохранение void и браузерной очереди. HTTP-очередь не ждёт завершения перевода; операции могут пересекаться. Отдельная проверка быстрого ввода с немедленным Submit явно не подтверждена.

Следующий шаг — согласовать состав коммита завершённого этапа. Ветка prototype, последний коммит c3bce7f; текущие изменения не закоммичены. Дополнительно изменены оформление и AGENTS.md, есть .codex; старые пресеты отмечены удалёнными. Не включать их автоматически. Дальнейшие изменения поведения обсуждать отдельно.

Актуальный контекст и ограничения: [handoff-context.md](handoff-context.md). Предлагаемые шаги: [VizNode_next_plan.md](ideas/VizNode_next_plan.md).
