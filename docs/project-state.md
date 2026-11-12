# Состояние проекта

Проверено: 2026-11-12. Это статус реализации, а не заявление о совместимости или готовности к публикации.

## Цель

Передавать почти непрерывное видео с камеры одной пары Meta Ray-Ban Display на дисплей другой пары с минимально достижимой задержкой. Показ заранее записанного ролика или редких снимков не считается выполнением цели.

## Что действительно работает

- Текущий код — браузерный React/Vite MVP: навигация Meta UI Toolkit, локальный чек-лист, экран проверки управления и отдельный пример Snake.
- Локальный экран DEMO/MOCK создаёт синтетический Canvas-поток и передаёт его через пару `RTCPeerConnection` внутри текущей вкладки в `<video>`; он измеряет частоту показа браузерного приёмника, останавливает дорожки и не запрашивает камеру, разрешения, сеть или сохранение.
- Проверено в Chromium/Playwright, не на очках. В коде нет DAT-интеграции, доступа к камере, реальной передачи между устройствами, backend или синхронизации.
- Адаптивный интерфейс под 600×600 (размеры от viewport, видимый фокус), манифест и иконка Meta (`public/.well-known/`). Проверено Playwright: `npm run check` — 12 браузерных тестов, 5 unit-тестов. Не проверено на очках.
- Опубликовано 2026-11-12 на GitHub Pages: https://petrozabashta.github.io/ray-ban-web-app-studio/ (HTTPS, манифест и иконка отдаются с правильными типами; проверено запросами). На очках не открывалось.
- Дистрибуция (по поиску 2026-11-12, не по официальному документу Meta): публичного магазина веб-приложений Meta Ray-Ban Display нет; приложение добавляется по HTTPS-URL в режиме разработчика. Подтвердить по документации Meta до публичных обещаний.
- Git не содержит коммитов; текущие файлы неотслеживаемые. Не считать историю изменений восстановленной.
- На этой Windows-машине доступны Node.js 22.21.0 и npm 11.6.2; `xcodebuild` и Swift отсутствуют. Установленный UI Toolkit — `@wearables-ui-toolkit/mrbd` и `icons` 129.23.0; в npm опубликована версия 130.33.0. iOS DAT SDK в проект не установлен.

## Критический путь по официальным источникам Meta

Все пункты ниже проверены по опубликованным документам 2026-11-12; аппаратные прогоны не выполнялись.

| Участок | Подтверждено документацией | Не подтверждено |
|---|---|---|
| Камера → мобильное приложение | DAT iOS 1.0.1 — официальный Swift Package. `DeviceSession.addCamera` и `videoFramePublisher` дают приложению кадры. Документированы 360×640, 504×896 и 720×1280; частоты запроса 2, 7, 15, 24 или 30 FPS. Bluetooth Classic может вызвать снижение качества; это не гарантия фактической частоты. Meta Ray-Ban Display входит в список устройств SDK. | Реальные кадры и частота на этих двух парах; работа при блокировке экрана/в фоне. |
| Изображение → дисплей | DAT Display `Image(uri:)` отображает изображение с URL; дисплей 600×600. Документация предупреждает о задержке при избыточном размере. | Частота замены изображений, минимальный интервал, буферизация, сохранение соединения и пригодность для видеокадров. |
| Видео → дисплей | `VideoPlayer` принимает MP4 по HTTPS, максимум 400 пикселей на сторону и 70 000 пикселей суммарно; одно видео на display session. | Live/сегментированный MP4, HLS, WebRTC и другие потоковые протоколы, буферизация и end-to-end задержка не документированы. Не считать обычную поддержку MP4 подтверждением live. |
| Один iPhone → две пары | `DeviceSession` связан с конкретным устройством; `AutoDeviceSelector` выбирает первое подключённое устройство. Разрешения учитывают несколько привязанных очков. | Одновременная работа двух `DeviceSession` на одном iPhone и маршрутизация кадров между ними. Документация о multi-device permissions этого не доказывает. |
| Два iPhone → две пары | DAT поддерживает iOS-клиент и указанные модели очков; камера и дисплей управляются из мобильных приложений. | Канал передачи между телефонами, его протокол, безопасность, relay и работа как единой live-сессии не определены Meta в проверенных материалах. |
| Сессия и разрешения | Пользователь регистрирует интеграцию через Meta AI и выдаёт camera permission там же. Сессии могут перейти в `PAUSED`/`STOPPED`; закрытие дужек разрывает Bluetooth, остановленный session нельзя переиспользовать. | Поведение конкретного приложения на реальной прошивке и правила продолжения камеры в фоне. |
| Web App | Документация Web Apps описывает browser UI для дисплея; камера доступна через DAT, не через этот React MVP. В списке возможностей Web Apps live-видео не описано. | Не делать вывод, что браузерный `<video>` невозможен; его пригодность для этого сценария просто не подтверждена документацией или экспериментом. |

### Версии и официальные источники

- DAT iOS **1.0.1**, официальный тег, дата changelog 2026-10-09; источник распространяется по Meta Wearables Developer Terms, а не как обычная permissive open-source лицензия: [iOS SDK tag](https://github.com/meta/meta-wearables-dat-ios/tree/1.0.1), [changelog](https://github.com/meta/meta-wearables-dat-ios/blob/main/CHANGELOG.md), [terms](https://wearables.developer.meta.com/terms).
- README официального iOS SDK говорит, что DAT analytics и сбор SDK crashes включены по умолчанию и настраиваются отдельно в `Info.plist`; до проверки реального перечня данных нельзя заполнять privacy labels. Для заявленной минимизации диагностики запланировать `MWDAT.Analytics.OptOut=true` и `MWDAT.CrashReporting.OptOut=true`, затем проверить, что нужная интеграция продолжает работать: [iOS SDK README](https://github.com/meta/meta-wearables-dat-ios/blob/1.0.1/README.md).
- [Meta Acceptable Use Policy](https://wearables.developer.meta.com/acceptable-use-policy) запрещает скрытую съёмку и обход индикаторов записи. Продукт не должен обходить аппаратные индикаторы; сценарий тестировать с явным запуском камеры и видимым состоянием.
- Для DAT 1.0.1 таблица Meta указывает Meta AI app V292 и firmware очков V128, iOS 17.2+ и Xcode 26.4+: [version dependencies](https://wearables.developer.meta.com/docs/develop/dat/version-dependencies/), [getting started](https://wearables.developer.meta.com/docs/develop/dat/getting-started-toolkit/).
- Камера и ограничения потока: [DAT streaming](https://wearables.developer.meta.com/docs/develop/dat/streaming/), [camera stream processing](https://wearables.developer.meta.com/docs/develop/dat/camera-stream-processing/).
- Изображение и MP4 на дисплее: [DAT Display for iOS](https://wearables.developer.meta.com/docs/develop/dat/display-ios/), [DeviceSession reference](https://wearables.developer.meta.com/docs/reference/ios_swift/dat/1.0/mwdatcore_devicesession), [AutoDeviceSelector reference](https://wearables.developer.meta.com/docs/reference/ios_swift/dat/1.0/mwdatcore_autodeviceselector).
- Регистрация и permissions: [permissions and registration](https://wearables.developer.meta.com/docs/develop/dat/permissions-requests/); выпуск интеграций и тестовые каналы: [release channels](https://wearables.developer.meta.com/docs/develop/dat/set-up-release-channels/), [project setup](https://wearables.developer.meta.com/docs/develop/dat/manage-projects/).
- Поддержка Web Apps и список документированных web-возможностей: [Web Apps overview](https://wearables.developer.meta.com/docs/develop/webapps/build/overview/).
- Apple требует достоверно декларировать сбор данных приложения и сторонних SDK: [App privacy details](https://developer.apple.com/app-store/app-privacy-details/); также применяются [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## Решение и ближайшая задача

**Локальный тест без отсутствующих физических устройств:** используйте экран «Локальная проверка видео DEMO/MOCK». Он проверяет только синтетический видеоисточник → браузерный WebRTC loopback → декодирование и показ в HTML video, включая stop/cleanup и отсутствие сетевых запросов. Это автоматизируемый software-test текущего проекта, не Meta DAT Mock Device Kit и не тест камеры/дисплея очков. FPS относится только к локальному браузерному получателю; end-to-end задержка не измеряется.

Meta отдельно публикует официальный **Mock Device Kit (DAT 1.0)**, который может симулировать SDK, camera feed из видео H.265, permissions и display без физических очков; до трёх mock glasses могут быть paired одновременно. Для браузерного preview официального дисплея Meta требует iOS app в iOS Simulator или Android app/emulator с DAT Mock Device Kit, плюс Chrome Simulator extension. iOS preview не работает от физического iPhone. Это самый близкий hardware-free тест Meta API, но текущая Windows-машина не имеет Xcode/Swift, Android Studio/SDK или `adb`, а этот проект не содержит mobile DAT app. Инструкции: [Mock Device Kit](https://wearables.developer.meta.com/docs/develop/dat/mock-device-kit/), [Display simulation](https://wearables.developer.meta.com/docs/develop/dat/display-simulation/), [iOS testing](https://wearables.developer.meta.com/docs/develop/dat/testing-mdk-ios/), [Android testing](https://wearables.developer.meta.com/docs/develop/dat/testing-mdk-android/).

Не добавлять live transport или backend до проверки выхода на принимающий дисплей. Минимальный диагностический эксперимент на macOS/Xcode и двух парах:

1. На DAT 1.0.1 подтвердить запуск camera stream и получение реальных `VideoFrame` на передающих очках.
2. Отдельно подтвердить на принимающих очках загрузку `Image(uri:)` с HTTPS URL.
3. Проверить, обновляется ли URL-изображение достаточно часто для целевого сценария; измерить реальную частоту и отдельно задержки доступными временными метками. Это только эксперимент: успешный показ картинки ещё не доказывает непрерывное видео.
4. Проверить один iPhone с двумя парами; если одновременные сессии не подтверждаются, проверить два телефона. Не считать кадр из исходного телефона доказательством его появления на дисплее получателя.

**Ближайшая реализация после эксперимента:** отдельный небольшой iOS DAT-клиент на подтверждённой версии SDK. До проверки принимающего API в этом репозитории не создаются фиктивные DAT-вызовы, транспорт, backend или «покадровая» замена требуемого видео.

## Коммерческая подготовка (черновик)

- **Описание для тестеров:** «Экспериментальная передача изображения с одной пары Meta Ray-Ban Display на другую. Почти непрерывный режим, задержка и список совместимых устройств пока не подтверждены. Не предназначено для критически важных задач.» Не использовать как публичное обещание продукта.
- **Privacy draft:** «Передача камеры запускается только по явному действию пользователя и после разрешения Meta AI. [Указать фактический маршрут кадров, серверы/поставщиков и срок хранения после выбора архитектуры.] [Подтвердить, что видео не записывается и не сохраняется.] [Перечислить фактически собираемую телеметрию, включая сторонние SDK.]» Это незаполненный черновик, не юридическая политика и не основание для отправки в App Store. Apple требует точных privacy details по данным приложения и сторонних партнёров. DAT iOS 1.0.1 включает аналитику и crash capture по умолчанию; запланированные opt-out выше ещё не настроены и не проверены.
- **Тестирование:** сначала проверить UI в Chrome/Simulator; затем на macOS с Xcode 26.4+ собрать DAT 1.0.1, включить Developer Mode, зарегистрировать app integration, выдать camera permission и протестировать две пары с актуальными Meta AI/firmware. Записать версию SDK/прошивки, выбранный FPS, полученные кадры, разрывы и метод измерения задержки; не сохранять изображения в логи. Browser tests не заменяют эти шаги.
- Meta описывает Wearables Developer Center, проекты и invite-only release channel для тестирования. Доступность production distribution для этой интеграции и коммерческая модель не подтверждены; требуется developer account и проверка актуальных developer terms/acceptable-use policy. Если нужен iPhone-клиент, отдельно потребуются Apple App Store privacy details и review; правила оплаты цифровых функций надо проверить после выбора модели продаж по актуальным [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). Ни аккаунты, ни публикация, ни согласование условий не выполнялись.

## Блокеры и статус

- Нет macOS/Xcode для сборки iOS-клиента и нет физического доступа к двум парам для end-to-end теста.
- Официальный Meta Mock Device Kit способен закрыть часть проверок без двух реальных пар, но ещё не интегрирован в этот web-only проект и не может быть собран в текущей Windows-среде.
- Нет подтверждения Meta для частого обновления `Image(uri:)`, live-режима `VideoPlayer` или двух одновременных device sessions на одном iPhone.
- Не выбран и не одобрен защищённый транспорт между телефонами; нельзя определить его хранение/приватность без этого выбора.
- Не проверены developer account/release channel, коммерческие условия SDK и App Store metadata на готовом продукте.

**Статус основного сценария: C** — критический участок вывода почти непрерывного изображения на принимающие очки не подтверждён документацией или устройствами. Это не утверждение, что сценарий невозможен. Следующее необходимое действие — эксперимент с двумя физическими парами, DAT 1.0.1 и macOS/Xcode.
