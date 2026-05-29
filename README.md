# VizNode

**Author:** Mark Kozynda, Russia, February 2026

## Vision

VizNode is a console-first interface experiment built around a simple idea:
modern platforms often bury straightforward user intent under noise, hooks, promotions, and unnecessary navigation.

VizNode takes the opposite approach:

- the console shows only what is needed for the current task
- interaction stays focused and minimal
- visual HTML is generated only on demand
- HTML is not a second live application, but a snapshot of the current UI node for inspection

The goal is not to replace the console with the web.
The goal is to keep the console as the primary runtime interface and use HTML only when visual context is actually useful.

## Concept

VizNode explores a model where:

- application state remains explicit and inspectable
- the interface is described as a node tree
- the same node tree can be rendered in different ways
- the default experience stays text-first and low-noise

In practice, this means a user can:

- navigate and act through a clean console flow
- avoid the clutter of full platform interfaces
- request a visual snapshot only for the exact item or screen they want to inspect

## Current Direction

The project is evolving toward this structure:

- `state -> node tree -> renderer`
- console renderer for the main interaction flow
- optional HTML snapshot renderer for visual inspection

This keeps one source of truth while allowing multiple views of the same interface state.

## Goals

- reduce interface noise around simple tasks
- preserve focus on user intent
- separate application logic from presentation
- support console-first interaction with optional visual output
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

VizNode — это эксперимент с console-first интерфейсом, построенный вокруг простой идеи:
современные платформы слишком часто прячут простое пользовательское намерение под шумом, крючками, промо-блоками и лишней навигацией.

VizNode предлагает обратный подход:

- консоль показывает только то, что нужно для текущей задачи
- взаимодействие остаётся сфокусированным и минималистичным
- визуальный HTML создаётся только по запросу
- HTML не является вторым живым приложением, а служит снимком текущей UI-ноды для просмотра

Цель не в том, чтобы заменить консоль вебом.
Цель в том, чтобы сохранить консоль как основной рабочий интерфейс, а HTML использовать только тогда, когда визуальный контекст действительно полезен.

### Концепция

VizNode исследует модель, в которой:

- состояние приложения остаётся явным и наблюдаемым
- интерфейс описывается как дерево нод
- одно и то же дерево нод может рендериться разными способами
- базовый пользовательский опыт остаётся текстовым и малошумным

На практике это означает, что пользователь может:

- перемещаться и выполнять действия через чистый консольный поток
- избегать перегруженных платформенных интерфейсов
- по запросу получать визуальный снимок только того экрана или объекта, который действительно нужен

### Текущее Направление

Проект развивается в сторону такой структуры:

- `state -> node tree -> renderer`
- консольный renderer для основного потока взаимодействия
- опциональный HTML snapshot renderer для визуального просмотра

Это позволяет сохранить один источник истины и при этом поддерживать несколько представлений одного и того же состояния интерфейса.

### Цели

- уменьшить интерфейсный шум вокруг простых задач
- сохранить фокус на намерении пользователя
- отделить логику приложения от представления
- поддерживать console-first взаимодействие с опциональной визуализацией
- исследовать минималистичную и наблюдаемую архитектуру UI

### Ключевая Ценность

VizNode не пытается построить интерфейс побольше.
Он пытается построить интерфейс потише.
