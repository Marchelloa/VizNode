# VizNode — План следующего этапа (разделение на модули)

## Причина разделения

Текущий `app.js` начал содержать несколько независимых архитектурных слоёв:

- state
- observer system
- effect handlers
- UI nodes
- tree builder
- renderer
- runtime loop

Из-за этого становится сложно:

- быстро восстанавливать контекст;
- понимать зависимости;
- удерживать архитектуру в голове;
- развивать систему дальше.

Разделение нужно не ради “красоты”, а для снижения когнитивной нагрузки.

---

# Главный принцип

Разделять по архитектурной ответственности, а не “по количеству строк”.

---

# Цель этапа

Перенести систему из одного большого файла в набор модулей,
сохранив текущую архитектуру без изменений поведения.

---

# Планируемая структура

src/
  app.js
  state.js
  nodes.js
  tree.js
  renderer.js
  observer.js
  effects.js

---

# Ответственность модулей

## app.js

Главная точка сборки приложения.

Содержит:

- readline setup
- runtime loop
- action handlers
- input handlers
- запуск приложения

`app.js` должен собирать систему, а не хранить всю реализацию.

---

## state.js

Содержит:

- state
- setByPath
- вспомогательные state utilities

State остаётся главным источником правды.

---

## nodes.js

Содержит фабрики UI-нод:

- textNode
- actionNode
- inputNode
- menuNode
- containerNode

---

## tree.js

Содержит:

- buildTree(state)

Этот слой отвечает только за преобразование state → node tree.

---

## renderer.js

Содержит:

- renderConsole
- renderNode
- renderChildren
- getChildren
- print
- spacer

Renderer ничего не знает о бизнес-логике.

---

## observer.js

Содержит:

- onStateChange
- notifyStateChanged

Observer system отвечает только за доставку событий.

Observer НЕ должен изменять state.

---

## effects.js

Содержит:

- effectLog
- logEffect
- serverTransferHandler
- subscriptions / observers

Effect handlers реагируют на события и выполняют side effects.

---

# Порядок разделения

Важно не дробить всё сразу.

## Шаг 1

Вынести:

- nodes.js
- renderer.js

Это самые безопасные и независимые части.

---

## Шаг 2

Вынести:

- observer.js
- effects.js

---

## Шаг 3

Вынести:

- state.js
- tree.js

---

## Шаг 4

Упростить app.js до orchestration layer.

---

# Важный архитектурный принцип

После разделения должно остаться:

Console App
    ↓
State
    ↓
Notify(reason)
    ↓
Effects

Разделение файлов НЕ должно менять модель работы системы.

---

# Что НЕ делать

Пока не нужно:

- усложнять observer system;
- добавлять event bus framework;
- добавлять dependency injection;
- превращать проект в enterprise architecture;
- добавлять HTTP/WebSocket;
- делать async everywhere.

---

# Критерий завершения этапа

Этап считается успешным если:

- проект работает так же, как до разделения;
- runtime loop не сломан;
- state observer продолжает работать;
- effect handlers продолжают реагировать;
- app.js становится заметно проще;
- архитектурный контекст легче восстанавливается.

---

# Следующий этап после разделения

После стабилизации модульной структуры:

1. HTML snapshot renderer
2. DOM visualization
3. Optional WebSocket sync
4. State diff experiments

---

# Ключевая мысль

Разделение файлов — это не косметика.

Это способ сделать архитектуру читаемой и удерживаемой в голове.
