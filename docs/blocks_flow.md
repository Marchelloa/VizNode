# VizNode: Архитектура блоков и потоков / Block Architecture & Flow

## English version

### Block Structure
Each block in state.js:
- `id` — unique identifier
- `description` — human/AI readable explanation
- `state` — current data value(s)
- `metadata` — optional info for visualization/UI

### Data Flow
1. Console input updates state blocks.
2. AI agent reads state blocks and generates HTML/JS UI.
3. User interacts with UI (optional).
4. Changes from UI propagate back to Node.js state blocks.
5. Node.js logic executes based on updated state.

---

## Русская версия

### Структура блока
Каждый блок в state.js содержит:
- `id` — уникальный идентификатор
- `description` — читаемое описание для человека и ИИ
- `state` — текущее значение данных
- `metadata` — дополнительная информация для визуализации или UI

### Поток данных
1. Ввод в консоли обновляет блоки состояния.
2. AI-агент читает блоки состояния и генерирует HTML/JS интерфейс.
3. Пользователь взаимодействует с интерфейсом (по желанию).
4. Изменения из интерфейса передаются обратно в блоки состояния Node.js.
5. Логика Node.js выполняется на основе обновлённых данных.