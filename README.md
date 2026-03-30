# VizNode

<p align="center">
  <b>State-driven UI for console-first applications</b><br>
  Bridge CLI logic with dynamic visualization
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-experimental-orange" />
  <img src="https://img.shields.io/badge/node.js-supported-green" />
  <img src="https://img.shields.io/badge/license-MIT-blue" />
</p>

---

## 📑 Table of Contents

* [Concept](#-concept)
* [Core Idea](#-core-idea)
* [Example](#-example)
* [Rendering Model](#-rendering-model)
* [Role of AI](#-role-of-ai)
* [Goals](#-goals)
* [Project Structure](#-project-structure)
* [Value](#-value)
* [Русская версия](#-русская-версия)

---

## 🧠 Concept

VizNode is an experimental project that bridges console-based Node.js applications with dynamic HTML/JS visualization.

Instead of treating UI as the primary layer, VizNode introduces an intermediate representation — a **semantic node tree**, describing:

* current application state
* context
* available actions

This enables a different approach to interfaces:

* The console remains the **source of truth**
* UI is derived from state, not defining it
* Visualization is generated on demand via DOM
* Rendering adapts without modifying application logic
* A universal set of interaction primitives is used (text, actions, lists, inputs)

---

## 🔄 Core Idea

```
State → Node Tree → Renderer → User Action → State
```

Where:

* **State** — application logic and data (backend / CLI runtime)
* **Node Tree** — abstract interface description
* **Renderer** — console, DOM, or other representations
* **Action** — user-triggered event mapped to backend logic

---

## 📦 Example

### Node Tree

```json
{
  "nodes": [
    { "type": "text", "text": "VizNode Bank" },
    {
      "type": "menu",
      "title": "Main Menu",
      "items": [
        { "type": "action", "id": "balance", "label": "Check Balance" },
        { "type": "action", "id": "transfer", "label": "Transfer" }
      ]
    }
  ]
}
```

### Console Representation

```
VizNode Bank

Main Menu
1. Check Balance
2. Transfer

>
```

### DOM Representation

```html
<h1>VizNode Bank</h1>

<div class="menu">
  <button data-action="balance">Check Balance</button>
  <button data-action="transfer">Transfer</button>
</div>
```

---

## 🏗 Rendering Model

VizNode does not convert console output into HTML.

Instead, it builds a shared interface model:

```
State
  ↓
Node Tree
  ↓
 ┌───────────────┬───────────────┐
 │               │               │
Console         DOM      Other Renderers
```

Each renderer independently interprets the same node tree.

---

## 🤖 Role of AI

AI is used only as a renderer or presentation enhancer.

It may:

* organize layout
* improve readability
* adapt styling

It does **not**:

* modify state
* introduce new actions
* change application logic

---

## 🎯 Goals

* Bridge console applications and interactive visualization
* Provide structured, state-driven UI representation
* Reduce interface noise and unnecessary interactions
* Preserve full control over logic in the application layer
* Explore console-centric UI paradigms without traditional GUI complexity

---

## 📁 Project Structure

```
VizNode/
├─ README.md      # Project description and concept
├─ src/           # Node.js source code (state, node tree, renderers)
├─ examples/      # Console blocks and visualization demos
├─ docs/          # Notes, diagrams, and additional materials
```

---

## 💡 Value

VizNode promotes a minimalist, state-driven philosophy:

* pure logic
* explicit actions
* minimal interface noise
* predictable interaction flow

UI becomes a projection of system state, not a source of logic.

---

# 🇷🇺 Русская версия

**Автор:** Козында Марк
**Дата:** февраль 2026

---

## 🧠 Концепция

VizNode — экспериментальный проект, соединяющий консольные Node.js приложения с динамической визуализацией.

Вместо того чтобы рассматривать интерфейс как основной слой, VizNode вводит промежуточное представление — **node tree**, описывающее:

* текущее состояние
* контекст
* доступные действия

Это позволяет:

* Консоли оставаться источником истины
* Строить интерфейс как производное от состояния
* Визуализировать состояние через DOM по запросу
* Адаптировать отображение без изменения логики
* Использовать универсальные элементы (текст, действия, списки, ввод)

---

## 🔄 Основная идея

```
Состояние → Node Tree → Рендер → Действие → Состояние
```

Где:

* **Состояние** — логика и данные приложения
* **Node Tree** — описание интерфейса
* **Рендер** — способ отображения (консоль, DOM и др.)
* **Действие** — событие пользователя

---

## 🏗 Модель рендера

VizNode не преобразует консольный вывод в HTML.

Он использует единое описание интерфейса:

```
Состояние
  ↓
Node Tree
  ↓
 ┌───────────────┬───────────────┐
 │               │               │
Консоль         DOM      Другие рендереры
```

---

## 🤖 Роль ИИ

ИИ используется только для визуализации.

Он может:

* улучшать отображение
* адаптировать интерфейс

Он не:

* управляет логикой
* изменяет состояние
* добавляет действия

---

## 💡 Ценность

VizNode — это попытка упростить интерфейсы:

* только полезная информация
* только доступные действия
* отсутствие лишнего визуального шума

Интерфейс становится отображением состояния, а не источником логики.
