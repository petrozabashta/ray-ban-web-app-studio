import { expect, test } from '@playwright/test';

test('checklist completes the home-to-task-to-home flow and persists changes', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('home-screen')).toBeVisible();

  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();
  await expect(page.getByTestId('checklist-screen')).toBeVisible();

  await page
    .getByRole('button', { name: 'Отметить выполненным: Открыть чек-лист' })
    .click();
  await expect(page.getByText('1 из 1 выполнено')).toBeVisible();

  await page.getByRole('button', { name: 'Назад на главный экран' }).click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();
  await expect(page.getByText('1 из 1 выполнено')).toBeVisible();
});

test('D-pad arrows move focus and Enter activates the focused control once', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Проверить управление' }).click();
  await expect(page.getByTestId('controls-screen')).toBeVisible();

  await page.getByRole('button', { name: 'Вверх' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('focused-control')).toHaveText('Сейчас выбрано: Вниз');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('control-result')).toHaveText('Выбрано: Вниз');
  await expect(page.getByTestId('control-activations')).toHaveText('1');
});

test('adds a task with the Toolkit input and requires confirmation to reset', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();

  const input = page.getByLabel('Текст нового пункта');
  await input.fill('Проверить длинный локальный пункт');
  await input.press('Enter');
  await expect(
    page.getByRole('button', {
      name: 'Отметить выполненным: Проверить длинный локальный пункт',
    }),
  ).toBeVisible();
  await expect(page.getByText('0 из 2 выполнено')).toBeVisible();

  await page.getByRole('button', { name: 'Сбросить список' }).click();
  await expect(page.getByText(/Удалить все пункты/)).toBeVisible();
  await page.getByRole('button', { name: 'Отмена очистки' }).click();
  await expect(page.getByText('0 из 2 выполнено')).toBeVisible();

  await page.getByRole('button', { name: 'Сбросить список' }).click();
  await page.getByRole('button', { name: 'Да, очистить список' }).click();
  await expect(page.getByText('0 из 0 выполнено')).toBeVisible();
});

test('keeps the persistence warning visible when browser storage is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    };
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();
  await expect(
    page.getByText('Локальное хранилище недоступно; список не будет сохранён.'),
  ).toBeVisible();

  await page.getByLabel('Текст нового пункта').fill('Временный пункт');
  await page.getByLabel('Текст нового пункта').press('Enter');
  await expect(
    page.getByText('Локальное хранилище недоступно; список не будет сохранён.'),
  ).toBeVisible();
});

test('screens fit device and desktop viewports without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();
  await page.getByLabel('Текст нового пункта').fill('x'.repeat(80));
  await page.getByLabel('Текст нового пункта').press('Enter');

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 600, height: 600 },
    { width: 400, height: 400 },
    { width: 1000, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test('all application screens stay usable at iPhone and glasses viewport sizes', async ({
  page,
}) => {
  await page.goto('/');

  const screens = [
    { button: 'Открыть рабочий чек-лист', testId: 'checklist-screen' },
    { button: 'Проверить управление', testId: 'controls-screen' },
    { button: 'Тест видео DEMO/MOCK', testId: 'mock-stream-screen' },
    { button: 'О приложении', testId: 'info-screen' },
  ];

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 600, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    for (const screen of screens) {
      await page.getByRole('button', { name: screen.button }).click();
      await expect(page.getByTestId(screen.testId)).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

      await page.locator('.screen-content').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await expect(
        page.getByRole('button', { name: 'Назад на главный экран' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Назад на главный экран' }).click();
    }
  }
});

test('diagnostic copy contains anonymous capability states only', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'О приложении' }).click();
  await expect(page.getByText('Не встроен')).toBeVisible();
  await expect(page.getByText('Не запрашивалось')).toBeVisible();
  await expect(page.getByText('Не проверяется без DAT')).toBeVisible();
  await expect(page.getByText('Не реализован')).toBeVisible();
  await page.getByRole('button', { name: 'Скопировать диагностику' }).click();
  await expect(page.getByRole('status')).toHaveText('Обезличенный отчёт скопирован.');

  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain('"metaDat": "not-integrated"');
  expect(report).toContain('"glassesCameraPermission": "not-requested"');
  expect(report).not.toContain('userAgent');
  expect(report).not.toContain('https://');
});

test('Meta Wearables manifest and icon are served with valid fields', async ({ request }) => {
  const response = await request.get('/.well-known/meta-wearables-manifest.json');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.version).toBe(1);
  expect(manifest.name.length).toBeGreaterThan(0);
  expect(manifest.appearance.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  const icon = await request.get('/.well-known/' + manifest.appearance.icon.src);
  expect(icon.ok()).toBe(true);
  expect(await icon.text()).toContain('<svg');
});

test('local DEMO/MOCK screen fits display and desktop viewport widths', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Тест видео DEMO/MOCK' })
    .click();

  for (const viewport of [
    { width: 600, height: 600 },
    { width: 1000, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test('local DEMO/MOCK stream reaches the receiver and releases resources on stop', async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') {
      externalRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page
    .getByRole('button', { name: 'Тест видео DEMO/MOCK' })
    .click();
  await expect(page.getByTestId('mock-stream-screen')).toBeVisible();
  await expect(page.getByRole('note')).toContainText('Это не Meta DAT');
  await page.waitForTimeout(500);
  const requestsBeforeStream = [...externalRequests];
  await page.getByRole('button', { name: 'Запустить локальный тест DEMO/MOCK' }).click();
  await expect(page.getByTestId('mock-stream-status')).toContainText(
    'тестовое видео показано',
    { timeout: 10_000 },
  );

  const receiverFrames = await page.getByTestId('mock-receiver').evaluate((element) => {
    const video = element as HTMLVideoElement;
    return video.getVideoPlaybackQuality().totalVideoFrames;
  });
  expect(receiverFrames).toBeGreaterThan(0);
  await expect(page.getByTestId('mock-stream-metrics')).toContainText(
    /Получатель показывает: [1-9]\d* кадров\/с/,
  );

  await page.getByRole('button', { name: 'Остановить локальный тест' }).click();
  await expect(page.getByTestId('mock-stream-status')).toHaveText('Тест остановлен.');
  await expect(page.getByTestId('mock-stream-metrics')).toContainText(
    'Получатель показывает: 0 кадров/с',
  );
  const released = await page.getByTestId('mock-receiver').evaluate((element) => {
    const video = element as HTMLVideoElement;
    return video.srcObject === null && video.paused;
  });
  expect(released).toBe(true);
  expect(externalRequests).toEqual(requestsBeforeStream);
});

test('local DEMO/MOCK stream reports unsupported browser APIs without requesting camera access', async ({
  page,
}) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'RTCPeerConnection', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => {
          throw new Error('Camera permission must not be requested');
        },
      },
    });
  });

  await page.goto('/');
  await page
    .getByRole('button', { name: 'Тест видео DEMO/MOCK' })
    .click();
  await page.getByRole('button', { name: 'Запустить локальный тест DEMO/MOCK' }).click();

  await expect(page.getByTestId('mock-stream-status')).toHaveText(
    'Локальный тест недоступен.',
  );
  await expect(page.getByRole('alert')).toContainText(
    'Браузер не поддерживает необходимые функции',
  );
  await page
    .getByRole('button', { name: 'Скопировать диагностику ошибки' })
    .click();
  await expect(page.getByText('Обезличенный отчёт скопирован.')).toBeVisible();
  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain('"failure": "unsupported_browser_api"');
  expect(report).not.toContain('Camera permission must not be requested');
});

test('the app and separate upstream Snake load without browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть рабочий чек-лист' }).click();
  await expect(page.getByTestId('checklist-screen')).toBeVisible();

  await page.goto('/examples/snake/index.html');
  await expect(page).toHaveTitle('Snake');
  await expect(page.getByRole('heading', { name: 'Snake' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Snake pauses its game loop while hidden and resumes when visible', async ({
  page,
}) => {
  await page.goto('/examples/snake/index.html');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.waitForTimeout(260);

  const canvas = page.locator('#game-canvas');
  const hiddenFrame = await canvas.evaluate((element) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    return (element as HTMLCanvasElement).toDataURL();
  });

  await page.waitForTimeout(320);
  const pausedFrame = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL(),
  );
  expect(pausedFrame).toBe(hiddenFrame);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(160);
  const resumedFrame = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL(),
  );
  expect(resumedFrame).not.toBe(pausedFrame);
});

test('production first load remains within startup budgets', async ({ page }) => {
  let requestCount = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('http://127.0.0.1:4173/')) {
      requestCount += 1;
    }
  });

  await page.goto('/');
  const transferBytes = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return (
      (navigation[0]?.transferSize ?? 0) +
      resources.reduce((total, resource) => total + resource.transferSize, 0)
    );
  });

  console.log(`Initial transfer: ${transferBytes} bytes; requests: ${requestCount}`);
  expect(transferBytes).toBeGreaterThan(0);
  expect(transferBytes).toBeLessThan(300 * 1024);
  expect(requestCount).toBeLessThan(15);
});
