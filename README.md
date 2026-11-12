# Ray-Ban Web App Studio

Лёгкая основа для небольших веб-приложений Meta Ray-Ban Display. Основной интерфейс построен на React, TypeScript, Vite и официальном UI Toolkit Meta. Чек-лист сохраняет данные только в локальном хранилище браузера.

Текущая цель проекта — исследовать передачу видео между двумя парами Meta Ray-Ban Display. Web MVP пока не подключён к камере или DAT; подтверждённое состояние, ограничения и ближайший эксперимент описаны в [docs/project-state.md](./docs/project-state.md).

## Быстрый старт на Windows

Требуются Node.js 22.12+ и npm 10+. Из папки проекта:

```powershell
npm ci
npm run dev
```

Откройте показанный Vite URL (обычно `http://localhost:5173/`) в обычном Chrome. Чтобы проверить финальную production-сборку:

```powershell
npm run check
npm run preview
```

Подготовка Playwright при первом запуске browser tests:

```powershell
npx playwright install chromium
```

## Симулятор

Откройте приложение в Chrome, нажмите значок установленного расширения Meta Ray-Ban Display Simulator и проверьте интерфейс в области 600×600. Инструкции по D-pad, контрасту и записи WebM находятся в [docs/simulator.md](./docs/simulator.md).

## Что есть в проекте

- Главный экран, рабочий чек-лист, проверка управления и сведения о среде.
- Локальный видеотест DEMO/MOCK: синтетический поток через WebRTC loopback без камеры и внешней сети.
- Чек-лист с локальным сохранением, проверкой некорректных данных и подтверждением сброса.
- Пример Snake из официального репозитория Meta, отдельно от основного приложения: `npm run snake`.
- VS Code tasks, Copilot instructions, unit tests, Playwright browser tests, CI и ручной GitHub Pages workflow.

## Проверки и локальная разработка

| Команда | Назначение |
|---|---|
| `npm run dev` | Запуск Vite для разработки |
| `npm run typecheck` | Строгая проверка TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Unit tests для логики списка |
| `npm run test:browser` | Production build и Playwright на production preview |
| `npm run check` | Все локальные проверки |
| `npm run build` | Production build |
| `npm run preview` | Локальный просмотр production build |
| `npm run snake` | Отдельный пример Snake на Vite dev server |

Полный набор проверок и границы измерений описаны в [docs/testing.md](./docs/testing.md).
Состояние основной цели и различие между локальным DEMO/MOCK и официальной эмуляцией Meta описаны в [docs/project-state.md](./docs/project-state.md).

## Как добавить экран или кнопку

Экран добавляется в `src/App.tsx` и отображается внутри Toolkit `App`/`Page`. Для действия используйте Toolkit `Button` с коротким `title` и `onActivate`. Навигацию стрелками оставляйте Toolkit; не создавайте конкурирующую систему фокуса. Для стилей соблюдайте адаптивный поток и семантический фон Toolkit.

## Публикация

Ничего не публикуется автоматически. Инструкция по ручному GitHub Pages workflow, base path и добавлению HTTPS URL в Meta AI приведена в [docs/deploy.md](./docs/deploy.md). Запуск workflow с подтверждением публикации доступен только вручную и требует явного согласия.

## Источники и ограничения

Использованные upstream-версии и лицензия примера перечислены в [docs/sources.md](./docs/sources.md). Возможности, проверенные только в браузере, и то, что ещё нужно испытать на очках, перечислены в [docs/capabilities.md](./docs/capabilities.md).
