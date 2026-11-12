# Установка на Windows

## Требования

- Windows и VS Code.
- Node.js 22.12 или новее и npm 10 или новее.
- Google Chrome. Расширение симулятора устанавливается отдельно из Chrome Web Store.

Проверка инструментов в PowerShell:

```powershell
Get-Location
git --version
node --version
npm --version
```

## Установка и запуск

Из каталога проекта выполните:

```powershell
npm ci
npm run dev
```

Откройте URL, напечатанный Vite, в Chrome. Для остановки сервера нажмите `Ctrl+C` в терминале.

Production preview запускается после сборки:

```powershell
npm run build
npm run preview
```

При первом запуске Playwright скачайте Chromium в кэш Playwright текущего пользователя:

```powershell
npx playwright install chromium
```

Пакеты устанавливаются в проект и в пользовательский кэш Playwright; глобальные npm-пакеты не нужны.

## VS Code

Откройте папку проекта. Рекомендуемые расширения указаны в `.vscode/extensions.json`; задачи находятся в **Terminal → Run Task**. `.vscode/settings.json` задаёт только настройки этого workspace.

Проектный `.vscode/mcp.json` содержит публичный Meta Wearables remote HTTP MCP без токенов. Формат `servers`/`type: "http"` проверен для установленного VS Code 1.144.1. По документации VS Code он может передать подходящий сервер Copilot harness; guided flow также помечает этот workspace-формат как compatibility/deprecated. VS Code может запросить доверие/разрешение на запуск. Сначала проверьте издателя и адрес; подключение не является подтверждением, что инструмент вызван. Если MCP не разрешён или недоступен, пользуйтесь ссылками на официальные страницы в [docs/sources.md](./sources.md).

## Отладка Chrome

Для ручного тестирования откройте обычный Chrome с установленным расширением симулятора. Отдельный профиль Chrome, который запускает отладчик VS Code или Playwright, может не содержать расширение. Автоматический запуск симулятора не настроен и не обещается.
