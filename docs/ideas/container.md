# Container Node

## Мотивация

В текущей модели интерфейс собирается как плоский список нод:

- text
- menu
- input
- action

С ростом сложности разные типы содержимого начинают смешиваться:

- информационный текст (статус, баланс, сообщения)
- поля ввода (input)
- действия (action)

Это усложняет:

- обновление отдельных частей экрана
- понимание структуры интерфейса
- повторное использование паттернов

---

## Идея

Ввести новый тип ноды: `container`.

Container объединяет связанные ноды в логические блоки.

Он:
- **не отвечает за layout** (в отличие от HTML `div`)
- служит **семантической группировкой элементов интерфейса**

---

## Пример

```json
[
  {
    "type": "container",
    "props": {
      "id": "info",
      "children": [
        { "type": "text", "props": { "text": "Transfer" } },
        { "type": "text", "props": { "text": "Balance: 12500 ₽" } }
      ]
    }
  },
  {
    "type": "container",
    "props": {
      "id": "form",
      "children": [
        { "type": "input", "props": { "id": "recipient", "label": "Recipient" } },
        { "type": "input", "props": { "id": "amount", "label": "Amount" } }
      ]
    }
  },
  {
    "type": "container",
    "props": {
      "id": "actions",
      "children": [
        { "type": "action", "props": { "id": "submit_transfer", "label": "Submit" } },
        { "type": "action", "props": { "id": "back", "label": "Back" } }
      ]
    }
  }
]
```
---
## Кратко

Container — это логическая группировка нод, которая позволяет:

разделить экран на смысловые области
упростить обновление отдельных частей интерфейса
подготовить модель к более сложным рендерам (DOM, AI)