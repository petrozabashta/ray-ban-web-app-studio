# Источники и лицензии

Дата проверки: 2026-11-03.

## Meta Wearables Web App Toolkit

- Upstream: <https://github.com/meta/meta-wearables-webapp>
- Проверенный `main` commit для файлов и примера: `f39fa1ce687015e25f68a9b82791447d88ba584f`.
- Проверены README, AGENTS.md, templates, плагины и инструкции навыков, `examples/snake`, LICENSE.
- Лицензия исходного примера: BSD-style; уведомление и disclaimer сохранены в `public/examples/snake/LICENSE`.
- Единственное функциональное изменение к Snake — пауза `setInterval` при `document.hidden` и возобновление при возвращении вкладки; остальные файлы примера сохранены исходными.

## Meta Ray-Ban Display UI Toolkit

- Upstream: <https://github.com/meta/meta-ray-ban-display-ui-toolkit-web>
- Проверенный commit документации/примеров: `1bdf42979eea6606ebcdc77571416d17794c09a9`.
- Установленные npm packages: `@wearables-ui-toolkit/mrbd@129.23.0` и `@wearables-ui-toolkit/icons@129.23.0`.
- Для использования библиотек соблюдайте их лицензии и условия, перечисленные в официальном [README](https://github.com/meta/meta-ray-ban-display-ui-toolkit-web/blob/main/README.md).

## Официальная документация и инструменты

- <https://wearables.developer.meta.com/docs/develop/webapps>
- <https://developers.meta.com/wearables/web-apps/>
- <https://wearables.developer.meta.com/docs/develop/webapps/design/overview/>
- Публичный Meta Wearables MCP: <https://mcp.developer.meta.com/wearables> (не подключался в этой сессии).
- VS Code MCP configuration: <https://code.visualstudio.com/docs/agents/reference/mcp-configuration>. Подтверждён workspace-формат `.vscode/mcp.json` с полем `servers` и remote HTTP сервером `type: "http"` для установленного VS Code 1.144.1. VS Code описывает этот формат как совместимый/deprecated в guided flow; Copilot harness напрямую читает portable `.mcp.json`, а VS Code пересылает подходящие серверы.

Официальные страницы использованы как fallback. MCP `search_webapps_docs` не вызывался: запуск MCP требует разрешения/доверия в VS Code, а такого подтверждения и инструмента в этой сессии не было.
