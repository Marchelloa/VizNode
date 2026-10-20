# VizNode — карта проекта

Актуализировано: 16 сентября 2026 года по текущему коду.

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
| `src/application.js` | Общий dispatch, банковские handlers, валидация формы, асинхронный перевод, статус и уведомления. |
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

`index.html` содержит постоянную оболочку и `#app`. `styles.css` выбирает CSS-пресет; сейчас подключён `styles.terminal.css`. Темы меняют оформление без изменения состояния. Отдельные `index.bank.html` и `index.terminal.html` — демонстрационные заготовки.

## Текущий API

```js
const application = createApplication({ requestRender });
application.state;
application.actionHandlers;
await application.dispatch({ type: "action", intent: "open_transfer" });
await application.dispatch({
  type: "input",
  bind: "transferForm.amount",
  value: "500",
});
```

Это API текущего банковского прототипа: state импортируется внутри application.js, а demo-сервер создаётся там же. Передача произвольных initialState, buildTree и handlers пока не реализована.

## Жизненный цикл

`requestRender` вызывает общий `loop()`: дерево строится один раз и передаётся Console и SSE-мосту. Console использует постоянный `rl.on("line", handleConsoleLine)`, а не вложенные `rl.question`. Во время sending loop не выводит новый prompt; это не запрет действий на уровне ядра.

Браузер отправляет события последовательно. HTTP-подтверждение означает принятие события. В случае submit_transfer обработчик запускает flow через void, поэтому dispatch не ожидает завершения перевода. После ответа demo-сервера flow обновляет состояние и запрашивает новый render.

## Статус и дальнейшая работа

Пользователь подтвердил, что основной прототип работает согласно замыслу. Автоматических тестов пока нет: npm test является заглушкой. Проверки задержек и ошибок DOM-ввода не зафиксированы как завершённые.

Основные открытые вопросы: обновление состояния и render как единый контракт; повторный Submit и ошибки async-операций; восстановление после ошибки input; валидация дерева и внешних событий; отделение ядра от банковского примера.

Направление обсуждения — понятный API для создания дерева и обработчиков. Второе небольшое приложение без изменения ядра предложено как критерий универсальности, но конкретный API и его реализация ещё не согласованы.

Актуальный контекст и ограничения: [handoff-context.md](handoff-context.md). Предлагаемые шаги: [VizNode_next_plan.md](ideas/VizNode_next_plan.md).
