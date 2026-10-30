# VizNode

**Author:** Mark Kozynda, Russia, February 2026

## English

### Thesis

**VizNode is an experiment in a user-controlled alternative to service-controlled web interfaces.**

It explores a model where an interface is derived from the user's current intent, trusted application state, and explicitly permitted actions—not from advertising, engagement metrics, cross-promotion, retention mechanics, or unnecessary navigation.

VizNode begins with a simple principle:

> The user should not have to pay for access to useful functionality with their attention.

A service may define its state and supported operations. That does not mean it should unconditionally control how those capabilities are presented to the user.

### Manifesto

The user's attention belongs to the user.

A web interface should help a person complete an intended action. It should not compete with that intention by inserting unrelated content, promotions, recommendations, or engagement mechanics.

Minimalism does not mean hiding important information. VizNode aims to show the minimum sufficient information required for an informed action.

The presentation should be replaceable and controlled by the user. Application facts and permitted operations must remain explicit, inspectable, and trusted.

### The Problem

Many modern web interfaces serve two different goals at once:

- helping the user complete a task;
- directing the user's attention toward the interests of the service.

A person may arrive with one straightforward intention but encounter banners, recommendations, unrelated features, promotional navigation, notifications, and additional flows before reaching the required operation.

In this model, the interface is not merely a tool. It is also a surface through which the service can influence behavior and monetize attention.

VizNode challenges that arrangement. It asks whether useful capabilities can be separated from the service-controlled presentation surrounding them.

### The VizNode Model

VizNode separates four concerns:

```text
state     — what is currently true
intent    — what the user is permitted to do
tree      — what should be presented for the current task
renderer  — how the user chooses to perceive and operate it
```

The architectural cycle is:

```text
state
  → interface tree
  → selected renderer
  → normalized user event
  → trusted application handler
  → new state
```

The interface tree is declarative. It describes text, actions, inputs, menus, and containers without containing executable business logic.

Renderers are replaceable. A console and a DOM interface can present the same tree without creating separate application behavior.

Actions are explicit. A rendered element carries a known `intent`, and the application decides whether a trusted handler exists for it.

### The Role of AI

AI is an optional and replaceable interface builder—not the source of truth and not the owner of application behavior.

A future AI builder may receive:

- a safe snapshot of the current state;
- the available node types;
- an allowlist of permitted intents and bindings;
- rules for composing the interface;
- a schema for the expected result.

It may return a declarative interface tree. It must not generate executable JavaScript, create new business operations, or bypass trusted application handlers.

The core idea of VizNode remains valid without AI. A deterministic builder can produce the same tree through the same contract.

### What VizNode Is Not

VizNode is not:

- an advertising blocker;
- a reader mode for existing pages;
- an AI chat placed on top of websites;
- an aggregator that reproduces existing service interfaces;
- a personalization engine for increasing engagement or conversion;
- a generator of arbitrary HTML or executable JavaScript;
- an attempt to hide information required for an informed decision.

It is an experiment in separating useful state and permitted operations from a presentation designed and controlled exclusively by the service.

### Current Architecture

The current prototype follows this cycle:

```text
Console event ─┐
               ├→ application.dispatch(event) → state → buildTree(state)
DOM event ─────┘                                         ├→ Console render
                                                        └→ SSE → DOM render
```

The main boundaries are:

- `src/state.js` stores the current application state;
- `src/tree.js` deterministically builds the current UI tree;
- `src/nodes.js` defines the available declarative node types;
- `src/console-renderer.js` renders the tree for the console;
- `src/dom-renderer.js` converts the same tree into DOM elements;
- `src/application.js` connects the application definition to normalized event dispatch;
- `src/browser-bridge.js` streams trees over SSE and forwards browser events to the application;
- `src/browser-demo.js` receives trees and adapts DOM actions into normalized events;
- `src/app.js` is the composition root for the shared state, console, and browser bridge.

Both renderers operate simultaneously on the same state and receive the same node tree. Application behavior is not duplicated between presentations, and a newly opened browser joins the current application screen rather than starting a separate session.

The supported setup is one application, the console, and one browser tab. Multiple tabs and cross-tab editing conflicts are outside the current scope. The bridge does not yet enforce a single-tab restriction.

Application dependencies are prepared by application code; services is optional and defaults to an empty object. The banking demo supplies services.server, while the flight log needs no service. Application behavior is defined in src/app-definition.js: state, services, actions and operations. The composition root passes this definition to createApplication with requestRender. The factory creates a shared ctx and calls actions by intent; operations are called explicitly by application code. Input still depends on operations.clearStatus(ctx), so the runtime is not yet fully generic.

Execution state is separate from application data: the shared ctx.runtime/application.runtime uses RuntimePhase (IDLE, PENDING, SUCCESS, ERROR). The console loop checks PENDING after rendering; application messages remain in state.message in the banking demo. Runtime changes do not automatically block input or publish state snapshots. The required clearStatus call on input remains an open coupling to remove.

### Current Prototype Status

Implemented:

- explicit application state;
- declarative `text`, `action`, `input`, `menu`, and `container` nodes;
- deterministic tree construction from state;
- renderer-independent application core;
- one trusted action-handler registry;
- normalized action and input events;
- console rendering and interaction;
- DOM rendering for all current node types;
- browser actions forwarded to the shared application through HTTP dispatch;
- live Node-to-browser tree updates through SSE;
- DOM input events with sequential input/action requests;
- focus, selection, and pending local input preservation during DOM rerendering;
- a minimal light stylesheet independent of application state;
- observer and effects channels;
- an asynchronous demonstration transfer flow.

Not yet implemented:

- event-specific input acknowledgements (the prototype currently compares HTTP acceptance and values from SSE);
- robust recovery from rejected input and network failures;
- strict structural and semantic tree validation;
- a replaceable `InterfaceBuilder` contract;
- deterministic and AI builder providers behind that contract;
- allowlists for external `intent` and `bind` values;
- a safe fallback when an external builder fails;
- automated tests for the complete cycle.

### Direction

The prototype is being developed as a sequence of small vertical steps:

1. Extend the completed manual transfer checks with rapid input followed immediately by Submit and delayed SSE updates.
2. Automate the manually verified navigation, input synchronization, form errors and transfer outcomes across console and DOM.
3. Define input failure, repeated action, and asynchronous completion behavior; add focused tests.
4. Design an understandable application API and evaluate it with a second small application, separating shared mechanisms from the banking demo. The state/actions/operations definition is implemented; broader lifecycle and update contracts remain open.
5. Formalize and validate the UI-tree contract, then introduce a replaceable interface builder with a deterministic provider.
6. Add an optional AI provider behind the same validated contract.

### Run the Prototype

1. Run `npm start` to start the console application and local browser bridge.
2. Open `index.html` through a local static server such as Live Server.
3. Use actions and edit form fields in either the console or browser.

The bridge listens on `127.0.0.1:3000`. Closing the browser does not stop the Node runtime; closing the console ends the application.

The goal is not to build a large UI framework. The goal is to test whether a quiet, user-controlled interface can remain useful, safe, and technically coherent.

### Core Value

VizNode is not trying to build a bigger interface.

It is trying to return the interface—and the user's attention—to the user.

---

## Русский

### Тезис

**VizNode — это эксперимент с пользовательской альтернативой веб-интерфейсам, контролируемым сервисами.**

Проект исследует модель, в которой интерфейс строится из текущего намерения пользователя, достоверного состояния приложения и явно разрешённых действий, а не из рекламы, метрик вовлечённости, перекрёстного продвижения, механик удержания и лишней навигации.

VizNode начинается с простого принципа:

> Пользователь не должен оплачивать доступ к полезной функции своим вниманием.

Сервис может определять своё состояние и поддерживаемые операции. Это не означает, что он должен безусловно контролировать способ представления этих возможностей пользователю.

### Манифест

Внимание пользователя принадлежит пользователю.

Веб-интерфейс должен помогать человеку выполнить задуманное действие. Он не должен конкурировать с этим намерением, добавляя нерелевантный контент, продвижение, рекомендации и механики вовлечения.

Минимализм не означает сокрытие важной информации. VizNode стремится показывать минимально достаточную информацию для осознанного действия.

Представление должно быть заменяемым и подконтрольным пользователю. Факты приложения и разрешённые операции должны оставаться явными, проверяемыми и доверенными.

### Проблема

Многие современные веб-интерфейсы одновременно обслуживают две разные цели:

- помогают пользователю выполнить задачу;
- направляют внимание пользователя в интересах сервиса.

Человек может прийти с одним простым намерением, но до нужной операции встретить баннеры, рекомендации, посторонние функции, рекламную навигацию, уведомления и дополнительные сценарии.

В такой модели интерфейс является не только инструментом. Он также становится поверхностью, через которую сервис влияет на поведение и монетизирует внимание.

VizNode ставит эту модель под сомнение. Проект исследует, можно ли отделить полезные возможности от окружающего их представления, контролируемого сервисом.

### Модель VizNode

VizNode разделяет четыре ответственности:

```text
state     — что действительно происходит сейчас
intent    — что пользователю разрешено сделать
tree      — что необходимо представить для текущей задачи
renderer  — как пользователь выбирает воспринимать интерфейс и управлять им
```

Архитектурный цикл выглядит так:

```text
state
  → дерево интерфейса
  → выбранный renderer
  → нормализованное пользовательское событие
  → доверенный обработчик приложения
  → новый state
```

Дерево интерфейса декларативно. Оно описывает текст, действия, поля ввода, меню и контейнеры, но не содержит исполняемой бизнес-логики.

Renderer можно заменить. Консоль и DOM способны представить одно и то же дерево без создания отдельных вариантов поведения приложения.

Действия явны. Отображённый элемент содержит известный `intent`, а приложение решает, существует ли для него доверенный обработчик.

### Роль AI

AI — это необязательный и заменяемый построитель интерфейса, а не источник истины и не владелец поведения приложения.

Будущий AI builder сможет получать:

- безопасный снимок текущего состояния;
- доступные типы нод;
- разрешённые списки `intent` и `bind`;
- правила композиции интерфейса;
- схему ожидаемого результата.

Он сможет вернуть декларативное дерево интерфейса. Он не должен генерировать исполняемый JavaScript, создавать новые бизнес-операции или обходить доверенные обработчики приложения.

Основная идея VizNode сохраняется и без AI. Детерминированный builder может создавать то же дерево через тот же контракт.

### Чем VizNode не является

VizNode — это не:

- блокировщик рекламы;
- режим чтения существующих страниц;
- AI-чат поверх веб-сайтов;
- агрегатор, воспроизводящий существующие интерфейсы сервисов;
- механизм персонализации ради увеличения вовлечённости или конверсии;
- генератор произвольного HTML или исполняемого JavaScript;
- попытка скрыть информацию, необходимую для осознанного решения.

Это эксперимент по отделению полезного состояния и разрешённых операций от представления, спроектированного и контролируемого исключительно сервисом.

### Текущая архитектура

Текущий прототип работает по циклу:

```text
Событие Console ─┐
                 ├→ application.dispatch(event) → state → buildTree(state)
Событие DOM ─────┘                                         ├→ Console render
                                                          └→ SSE → DOM render
```

Основные границы:

- `src/state.js` хранит текущее состояние приложения;
- `src/tree.js` детерминированно строит текущее UI-дерево;
- `src/nodes.js` определяет доступные типы декларативных нод;
- `src/console-renderer.js` отображает дерево в консоли;
- `src/dom-renderer.js` преобразует то же дерево в DOM-элементы;
- `src/application.js` подключает описание приложения к диспетчеризации нормализованных событий;
- `src/browser-bridge.js` передаёт деревья через SSE и направляет события браузера в приложение;
- `src/browser-demo.js` получает деревья и преобразует действия DOM в нормализованные события;
- `src/app.js` связывает общее состояние, консоль и browser bridge.

Оба renderer одновременно работают с одним состоянием и получают одно дерево нод. Поведение приложения не дублируется между представлениями, а новая вкладка подключается к текущему экрану приложения вместо запуска отдельной сессии.

Поддерживаемый сценарий — одно приложение, консоль и одна браузерная вкладка. Несколько вкладок и конфликты между ними не входят в текущий объём. Технического запрета второго подключения пока нет.

Зависимости подготавливает приложение: services необязательно и по умолчанию равно пустому объекту. Банковское демо передаёт services.server, журнал обходится без сервисов. Поведение задано в src/app-definition.js: state, services, actions и operations. Точка сборки передаёт описание в createApplication вместе с requestRender. Фабрика создаёт общий ctx и вызывает actions по intent; операции вызываются явно кодом приложения. Input пока зависит от operations.clearStatus(ctx), поэтому runtime ещё не полностью универсален.

Состояние выполнения отделено от данных приложения: общий ctx.runtime/application.runtime использует RuntimePhase (IDLE, PENDING, SUCCESS, ERROR). Console-loop проверяет PENDING после render, прикладные сообщения банковского демо остаются в state.message. Изменение runtime автоматически не блокирует ввод и не публикует снимок state. Обязательный вызов clearStatus при input остаётся открытым вопросом.

### Текущее состояние прототипа

Реализовано:

- явное состояние приложения;
- декларативные ноды `text`, `action`, `input`, `menu` и `container`;
- детерминированное построение дерева из состояния;
- независимое от renderer прикладное ядро;
- единый реестр доверенных обработчиков;
- нормализованные события action и input;
- консольное отображение и взаимодействие;
- DOM-рендеринг всех текущих типов нод;
- передача действий браузера в общее приложение через HTTP dispatch;
- живые обновления дерева из Node в браузер через SSE;
- DOM-события ввода и последовательная отправка input/action;
- сохранение фокуса, выделения и неподтверждённого локального ввода при повторном DOM-рендере;
- лаконичное светлое оформление, независимое от состояния приложения;
- каналы observer и effects;
- асинхронный демонстрационный сценарий перевода.

Пока не реализовано:

- подтверждение конкретного события ввода (прототип пока сопоставляет принятие через HTTP и значения из SSE);
- надёжное восстановление после отклонённого ввода и сетевых ошибок;
- строгая структурная и семантическая валидация дерева;
- контракт заменяемого `InterfaceBuilder`;
- детерминированный и AI providers за этим контрактом;
- разрешённые списки внешних значений `intent` и `bind`;
- безопасный fallback при ошибке внешнего builder;
- автоматические тесты полного цикла.

### Направление развития

Прототип развивается последовательностью небольших вертикальных шагов:

1. Дополнить выполненные ручные проверки перевода быстрым вводом с немедленным Submit и задержанными SSE-обновлениями.
2. Автоматизировать проверенные вручную навигацию, синхронизацию полей, ошибки формы и результаты перевода в Console/DOM.
3. Определить поведение при ошибке ввода, повторном действии и завершении асинхронной операции; добавить целевые тесты.
4. Спроектировать понятный API приложения и проверить его на втором небольшом примере, отделив общие механизмы от банковской логики. Описание state/actions/operations уже реализовано; общие контракты обновления и жизненного цикла ещё предстоит уточнить.
5. Формализовать и валидировать контракт UI-дерева, затем ввести заменяемый interface builder с детерминированным provider.
6. Добавить необязательный AI provider за тем же валидируемым контрактом.

### Запуск прототипа

1. Выполнить `npm start`, чтобы запустить консольное приложение и локальный browser bridge.
2. Открыть `index.html` через локальный статический сервер, например Live Server.
3. Выполнять действия и редактировать поля формы в консоли или браузере.

Мост слушает `127.0.0.1:3000`. Закрытие браузера не останавливает Node runtime; закрытие консоли завершает приложение.

Цель проекта — не построить большой UI-фреймворк. Цель — проверить, может ли спокойный пользовательский интерфейс оставаться полезным, безопасным и технически цельным.

### Ключевая ценность

VizNode не пытается построить интерфейс побольше.

Он пытается вернуть интерфейс — и внимание пользователя — пользователю.
