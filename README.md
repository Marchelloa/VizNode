# VizNode

**Author:** Mark Kozynda, Russia, February 2026

## Vision

VizNode is an interface experiment built around a simple idea:
modern platforms often bury straightforward user intent under noise, hooks, promotions, and unnecessary navigation.

VizNode takes the opposite approach:

- every renderer shows only what is needed for the current task
- interaction stays focused and minimal
- application behavior is independent from its console or DOM representation
- console and DOM use the same state, node tree, events, and trusted action handlers

The console is the currently connected interface. A DOM renderer now builds a static DOM representation from the same node tree; browser event dispatch and the browser entry point are the next integration steps.

## Concept

VizNode explores a model where:

- application state remains explicit and inspectable
- the interface is described as a node tree
- the same node tree can be rendered in different ways
- renderers produce the same normalized action and input events

In practice, this means a user can:

- navigate and act through a clean console or DOM flow
- avoid the clutter of full platform interfaces
- switch presentation without changing application handlers or backend behavior

## Current Direction

The current application foundation follows this structure:

- `state -> node tree -> renderer -> normalized event -> application -> state`
- `application.js` contains shared application behavior and action handlers
- `app.js` adapts console input to normalized application events
- `console-renderer.js` renders the tree for the current console entry point
- `dom-renderer.js` renders all current node types into a static DOM tree
- DOM events and a browser entry point can be added against the existing application contract
- an AI provider can later build the same declarative tree

This keeps one source of truth and one behavior layer while allowing multiple presentations of the same interface state.

## Goals

- reduce interface noise around simple tasks
- preserve focus on user intent
- separate application logic from presentation
- support interchangeable console and DOM presentations on one application core
- explore minimal, inspectable UI architecture

## Project Structure

```text
VizNode/
|- README.md
|- src/
|- examples/
|- docs/
```

## Core Value

VizNode is not trying to build a bigger interface.
It is trying to build a quieter one.

## Русская Версия

### Видение

VizNode — это эксперимент с интерфейсом, построенный вокруг простой идеи:
современные платформы слишком часто прячут простое пользовательское намерение под шумом, крючками, промо-блоками и лишней навигацией.

VizNode предлагает обратный подход:

- каждый renderer показывает только то, что нужно для текущей задачи
- взаимодействие остаётся сфокусированным и минималистичным
- поведение приложения не зависит от консольного или DOM-представления
- консоль и DOM используют общий state, дерево нод, события и доверенные обработчики

Консоль остаётся текущим подключённым интерфейсом. DOM renderer уже строит статическое DOM-представление из того же дерева нод; следующими шагами остаются DOM-события и browser entry point.

### Концепция

VizNode исследует модель, в которой:

- состояние приложения остаётся явным и наблюдаемым
- интерфейс описывается как дерево нод
- одно и то же дерево нод может рендериться разными способами
- разные renderer формируют одинаковые нормализованные события action и input

На практике это означает, что пользователь может:

- перемещаться и выполнять действия через чистый консольный или DOM-поток
- избегать перегруженных платформенных интерфейсов
- менять представление без изменения обработчиков приложения и backend-поведения

### Текущее Направление

Текущая основа приложения следует структуре:

- `state -> node tree -> renderer -> normalized event -> application -> state`
- `application.js` содержит общую прикладную логику и обработчики действий
- `app.js` преобразует консольный ввод в унифицированные события приложения
- `console-renderer.js` отображает дерево для текущей консольной точки входа
- `dom-renderer.js` преобразует все текущие типы нод в статическое DOM-дерево
- DOM-события и browser entry point смогут использовать существующий контракт приложения
- AI provider позднее сможет строить то же декларативное дерево

Это позволяет сохранить единый источник истины и единый слой поведения при нескольких представлениях одного состояния интерфейса.

### Цели

- уменьшить интерфейсный шум вокруг простых задач
- сохранить фокус на намерении пользователя
- отделить логику приложения от представления
- поддерживать взаимозаменяемые console и DOM-представления на общем ядре
- исследовать минималистичную и наблюдаемую архитектуру UI

### Ключевая Ценность

VizNode не пытается построить интерфейс побольше.
Он пытается построить интерфейс потише.
