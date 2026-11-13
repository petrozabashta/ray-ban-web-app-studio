# Размещение и подключение

## Текущая публикация Web App

Браузерный Web App уже опубликован на GitHub Pages:

- URL: <https://petrozabashta.github.io/ray-ban-web-app-studio/>
- Репозиторий: <https://github.com/petrozabashta/ray-ban-web-app-studio>

Публикация этого сайта доставляет только browser Web App. Она не устанавливает DAT, не подключает камеру и не публикует нативный клиент.

В репозитории есть ручной GitHub Pages workflow `.github/workflows/pages.yml`. Он запускается только вручную и требует checkbox `confirm_publication`. Изменения в этой сессии не коммитить, не отправлять и не публиковать без отдельного подтверждения пользователя.

## Meta Wearables manifest

Meta Ray-Ban Display читает имя и иконку из `/.well-known/meta-wearables-manifest.json` относительно URL запуска. В проекте это [public/.well-known/meta-wearables-manifest.json](../public/.well-known/meta-wearables-manifest.json) и [public/icon.svg](../public/icon.svg). Путь `../icon.svg` относителен манифесту и работает при project base path. URL манифеста должен отдаваться по HTTPS как JSON. На физическом устройстве рендер иконки ещё не проверялся.

## Открытие в очках

По текущей документации Meta:

1. Убедитесь, что очки подключены к Meta AI, и включите Developer Mode, если соответствующий пункт доступен.
2. Откройте **App Settings → Apps → Web Apps → Connect Web App**.
3. Введите HTTPS URL выше и сохраните.
4. Запустите приложение из app grid очков.

Расположение пунктов интерфейса и доступность функции могут зависеть от версии Meta AI, аккаунта и региона. Проверенный порядок и результаты на конкретном устройстве см. в [плане тестирования](./device-test-plan.md).

## Сборка

```powershell
npm ci
npm run check
npm run build
```

Проект — статическая Vite-сборка в `dist/`; `VITE_BASE_PATH` задаёт base path. Другой статический HTTPS-хостинг возможен при корректной раздаче файлов и well-known manifest. Публикация в этой документации не считается проверкой интеграции с очками.

## Отдельно о нативном DAT и App Store

Публикация Web App по URL не равна App Store публикации. Актуальное руководство Meta по iOS DAT прямо предупреждает, что App Store submission для DAT сейчас не поддерживается и приложение может быть отклонено из-за `ExternalAccessory`, MFi и privacy manifest требований. Для тестирования DAT Meta описывает Developer Mode и приватный invite-only Beta release channel. Проверяйте актуальные требования Meta до выбора канала распространения.
