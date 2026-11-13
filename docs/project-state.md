# Состояние проекта

Проверено 2026-11-13. Это статус реализации и сверки с официальной документацией, а не результат теста на очках.

## Цель

Проверить возможность почти непрерывно передавать изображение с камеры одной пары Meta Ray-Ban Display на дисплей другой пары с минимально достижимой задержкой. Записанный ролик или локальный браузерный loopback не считаются выполнением цели.

## Что реально работает

- React/TypeScript/Vite Web App с Toolkit `App`, `Page`, `Button` и штатной навигацией, работающий в Chromium на очках по опубликованному HTTPS URL. На 2026-11-13 опубликованная версия: https://petrozabashta.github.io/ray-ban-web-app-studio/
- Главный экран, локальный чек-лист (localStorage), проверка клавиатуры/фокуса, экран сведений и отдельный пример Snake.
- DEMO/MOCK тест создаёт синтетический Canvas-сигнал, передаёт его через WebRTC loopback в той же вкладке и измеряет отображаемый FPS. Камера и разрешения не запрашиваются; видеоданные не отправляются или сохраняются.
- Экран сведений показывает границы текущей реализации. Обезличенный диагностический JSON копируется только по запросу; он не включает URL, user-agent, текст исключения, токены или кадры. Ошибка копирования отображается пользователю. Потеря WebRTC-соединения DEMO/MOCK отделяется от отсутствия DAT.
- `docs/device-test-plan.md` содержит порядок проверки Web App на одной паре и отдельно помечает заблокированные DAT/двухпарные тесты.
- `npm run check` прошёл 2026-11-13: typecheck, lint, 6 unit-тестов, сборка и 14 Playwright-тестов. Все пять экранов визуально просмотрены в Chromium при 600×600 и 390×844; проверено отсутствие горизонтального overflow. Это не тест на физическом устройстве.
- Web App-код опубликован из коммита `ee3b9f6`; Pages workflow `43386812530` завершился успешно. Главная страница, JS/CSS, manifest и icon ответили HTTP 200; smoke test на опубликованном URL прошёл DEMO start/stop и открыл экран диагностики без ошибок страницы. Это только browser check, не тест на очках.

## Официально подтверждено документацией Meta

Проверено 2026-11-13. Версии страницы документации: Web Apps — актуальная публичная документация без SDK version; DAT — guide/reference 1.0, версия dependency table содержит 1.0.1.

| Тема | Подтверждённое | Граница вывода |
|---|---|---|
| Web App | Web App работает в Chromium-браузере на Meta Ray-Ban Display. URL подключается через Meta AI при Developer Mode; в документации путь `App Settings → Apps → Web Apps → Connect Web App`. Контент Web App рисуется на очковом дисплее, телефон используется для настройки/подключения. | Доступность пункта меню зависит от аккаунта/версии/региона; конкретная модель и ПО пользователя не проверены на устройстве. |
| Web APIs | Только DAT предоставляет интеграции доступ к камере очков и захвату микрофона; web-приложения получают сказанный текст, введённый в поле, а не raw audio/camera stream. | Наличие Chromium API вроде `getUserMedia` не является доступом к камере очков и в проекте не используется. |
| DAT платформы и устройства | DAT имеет клиентские SDK для iOS и Android и список поддерживаемого оборудования включает Meta Ray-Ban Display. Для DAT 1.0.1 таблица указывает Meta AI V292 и firmware V128 для Display. Требования SDK: iOS 17.2+ / Xcode 26.4+; Android 10+ / Android Studio Flamingo+ / Kotlin 2.2+. | Пользователь сообщил iPhone 18 Pro Max, iOS 27.2, Meta AI V297.1.0.17.153 и Display firmware 00GQ V129. Эти значения выше версий в DAT 1.0.1 dependency table, но не были независимо прочитаны с устройств. Совпадение версий не гарантирует server-gated возможности. |
| Камера через DAT | Мобильный клиент получает кадры `VideoFrame` от сессии очков. Документированные размеры: 360×640, 504×896 и 720×1280; запрашиваемые частоты 2, 7, 15, 24 и 30 FPS. Bluetooth Classic может вызвать автоматическое снижение качества. | FPS/задержка на реальных очках не измерялись. |
| Вывод видео через DAT Display | `VideoPlayer` воспроизводит на очках видео с HTTPS URL. Формат MP4; максимум 400 пикселей на сторону и 70 000 пикселей суммарно; одно видео на display session. Это вывод полноэкранного проигрывателя. | Документация не подтверждает WebRTC/HLS/MJPEG, push-кадры, сегментированный MP4 или непрерывное обновление ролика как live-режим. Обычный MP4 playback не равен live-видео. |
| Распространение DAT | Meta описывает приватный invite-only Beta release channel в Wearables Developer Center; для Developer Mode одновременно зарегистрировано только одно стороннее приложение. | Не найден публичный production-магазин DAT-интеграций/доступный production channel для этого продукта. |
| Apple App Store | Актуальное руководство Meta прямо предупреждает: App Store submission «not currently supported»; использующийся `ExternalAccessory` может привести к отказу из-за MFi и privacy manifest требований. | iOS DAT-приложение нельзя представлять как готовое к публикации в App Store. |

### Официальные источники

- [Choose between DAT and Web Apps](https://wearables.developer.meta.com/docs/develop/webapps/build/overview/) и [Load a Web App on glasses](https://wearables.developer.meta.com/docs/develop/webapps/setup/).
- [DAT overview / supported hardware](https://wearables.developer.meta.com/docs/develop/dat/getting-started-toolkit/), [version dependencies](https://wearables.developer.meta.com/docs/develop/dat/version-dependencies/).
- [Camera streaming](https://wearables.developer.meta.com/docs/develop/dat/streaming/), [iOS Display API](https://wearables.developer.meta.com/docs/develop/dat/display-ios/), [Android Display API](https://wearables.developer.meta.com/docs/develop/dat/display-android/).
- [iOS integration guide](https://wearables.developer.meta.com/docs/develop/dat/build-integration-ios/) (App Store warning), [Android integration guide](https://wearables.developer.meta.com/docs/develop/dat/build-integration-android/).
- [Permissions and registration](https://wearables.developer.meta.com/docs/develop/dat/permissions-requests/), [release channels](https://wearables.developer.meta.com/docs/develop/dat/set-up-release-channels/).

## Реализуемость главного сценария

Web App сам по себе не может получить live-кадры камеры очков. Для источника нужен нативный DAT-клиент на телефоне. Такой клиент документирован и для iOS, и для Android — iOS не является обязательной платформой в общем случае. Для данного пользователя iPhone делает iOS практичным путём проверки, но требует Mac/Xcode.

Поддерживаемый DAT Display способен показать MP4 по HTTPS на принимающей паре. Документированного live-видеовхода на дисплей нет. Передача с источника потребовала бы отдельно получать camera frames, безопасно передавать их между телефонами и подать пригодный для поддержанного `VideoPlayer` ресурс принимающему DAT-клиенту. Последнее live-звено не подтверждено; не делаем вывод ни о невозможности, ни о готовности сценария.

Одни очки и один iPhone позволяют проверять подключение Web App и, после появления нативного DAT-тестового клиента, отдельные операции «камера → приложение» и «MP4 → дисплей». Они не позволяют подтвердить передачу между двумя очками. Архитектуру и транспорт между телефонами не строить до отдельного доказательства пригодного выхода на принимающий дисплей.

## Среда, проверки и релиз

- Репозиторий: `main`, на старте задачи последний коммит `d33ace8` и рабочее дерево было чистым. Изменения текущей задачи незакоммичены; commit/push/publication не выполнялись.
- Windows: Node.js/npm установлены; `xcodebuild`, Swift, Java, adb и Gradle отсутствуют. iOS-сборка не выполнялась. Android SDK-клиент тоже не собирался.
- Команды: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:browser`, `npm run check`.
- GitHub Pages — только доставка browser Web App, не публикация DAT-клиента и не доказательство интеграции с очками.
- Результаты текущей работы и статусы физических тестов записаны в [device-test-plan.md](./device-test-plan.md).

## Статус и следующий шаг

**Основной двухпарный сценарий: C — live video до принимающего дисплея не подтверждено официальным API или экспериментом.** Это конкретный блокер, но не доказательство невозможности.

Следующий проверяемый этап: пользователь открывает опубликованный Web App на одной паре и возвращает результаты по шагам в [device-test-plan.md](./device-test-plan.md). Сообщённые версии выше DAT 1.0.1 baseline, но требуют подтверждения фактическими экранами устройства. Для DAT нужны Mac с Xcode 26.4+ и Developer Mode; сначала следует получить кадр с одной пары, затем отдельно вывести поддержанный MP4. Только после этого имеет смысл экспериментировать с live-путём. Для двухпарного end-to-end всё равно нужны вторая пара и отдельный телефон либо документированная поддержка двух сессий на одном телефоне.

### Продолжение в новой сессии

Откройте репозиторий `ray-ban-web-app-studio`, прочитайте этот файл и [device-test-plan.md](./device-test-plan.md), проверьте `git status`, затем продолжайте с численной сверки версий и Web App теста на одной паре. Не коммитьте, не отправляйте push и не запускайте публикацию без отдельного подтверждения в этой сессии.
