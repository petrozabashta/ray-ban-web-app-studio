import { useEffect, useState } from 'react';
import {
  App as ToolkitApp,
  InputTextView,
  Page,
  State,
} from '@wearables-ui-toolkit/mrbd';
import packageJson from '../package.json';
import { FullWidthButton } from './FullWidthButton';
import { MockStreamScreen } from './MockStreamScreen';
import {
  createChecklistItem,
  findNextIncompleteItem,
  MAX_ITEM_COUNT,
  MAX_ITEM_LENGTH,
  parseChecklist,
  STORAGE_KEY,
  toggleChecklistItem,
  type ChecklistItem,
} from './checklist';

type Screen = 'home' | 'checklist' | 'controls' | 'info' | 'mock-stream';

const newItemId = (): string => `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function readChecklist(): { items: ChecklistItem[]; warning: string | null } {
  try {
    return parseChecklist(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {
      items: parseChecklist(null).items,
      warning: 'Локальное хранилище недоступно; список не будет сохранён.',
    };
  }
}

export function App() {
  const [initialChecklist] = useState(readChecklist);
  const [screen, setScreen] = useState<Screen>('home');
  const [items, setItems] = useState(initialChecklist.items);
  const [persistenceNotice, setPersistenceNotice] = useState(initialChecklist.warning);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastControl, setLastControl] = useState('Нажмите стрелку, затем Enter.');
  const [focusedControl, setFocusedControl] = useState('Не выбран');
  const [controlActivations, setControlActivations] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasStorage, setHasStorage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);
    return () => {
      window.removeEventListener('online', updateOnlineState);
      window.removeEventListener('offline', updateOnlineState);
    };
  }, []);

  useEffect(() => {
    const probeKey = `${STORAGE_KEY}:probe`;
    try {
      window.localStorage.setItem(probeKey, 'ok');
      window.localStorage.removeItem(probeKey);
      setHasStorage(true);
    } catch {
      setHasStorage(false);
      setPersistenceNotice(
        (current) => current ?? 'Локальное хранилище недоступно; список не будет сохранён.',
      );
    }
  }, []);

  useEffect(() => {
    if (!isDirty || !hasStorage) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setPersistenceNotice(null);
    } catch {
      setPersistenceNotice('Не удалось сохранить список в браузере.');
    }
  }, [hasStorage, isDirty, items]);

  const addItem = (text: string) => {
    const item = createChecklistItem(text, newItemId());
    if (!item) {
      setStatusMessage(`Введите текст длиной до ${MAX_ITEM_LENGTH} символов.`);
      return;
    }
    if (items.length >= MAX_ITEM_COUNT) {
      setStatusMessage(`Можно сохранить не более ${MAX_ITEM_COUNT} пунктов.`);
      return;
    }

    setItems((current) => [...current, item]);
    setSelectedId(item.id);
    setDraft('');
    setStatusMessage(null);
    setIsDirty(true);
  };

  const toggleItem = (id: string) => {
    setItems((current) => toggleChecklistItem(current, id));
    setStatusMessage(null);
    setIsDirty(true);
  };

  const resetItems = () => {
    setItems([]);
    setSelectedId(null);
    setConfirmReset(false);
    setStatusMessage(null);
    setIsDirty(true);
  };

  const goBack = () => {
    setScreen('home');
    setConfirmReset(false);
  };

  const renderHome = () => (
    <Page headerText="Ray-Ban Studio" className="studio-page">
      <main className="screen-content" data-testid="home-screen">
        <header className="hero">
          <span className="hero-badge">MVP · DEMO/MOCK</span>
          <h1>Ray-Ban Web App Studio</h1>
          <p>Лёгкая стартовая площадка для веб-приложений очков.</p>
        </header>
        <div className="action-list">
          <FullWidthButton
            title="Открыть рабочий чек-лист"
            onActivate={() => setScreen('checklist')}
          />
          <FullWidthButton title="Проверить управление" onActivate={() => setScreen('controls')} />
          <FullWidthButton
            title="Тест видео DEMO/MOCK"
            onActivate={() => setScreen('mock-stream')}
          />
          <FullWidthButton title="О приложении" onActivate={() => setScreen('info')} />
          <FullWidthButton
            title="Открыть пример Snake"
            onActivate={() => {
              window.location.href = `${import.meta.env.BASE_URL}examples/snake/index.html`;
            }}
          />
        </div>
      </main>
    </Page>
  );

  const renderChecklist = () => (
    <Page headerText="Рабочий чек-лист" className="studio-page">
      <main className="screen-content" data-testid="checklist-screen">
        <p>Отметьте готовое или добавьте короткий пункт.</p>
        <div className="item-form">
          <InputTextView
            text={draft}
            hint="Новый пункт"
            onTextChange={setDraft}
            onSend={addItem}
            inputProps={{
              'aria-label': 'Текст нового пункта',
              maxLength: MAX_ITEM_LENGTH,
            }}
            showActionButton={false}
          />
          <FullWidthButton title="Добавить пункт" onActivate={() => addItem(draft)} />
        </div>

        <p className="list-count" aria-live="polite">
          {items.filter((item) => item.completed).length} из {items.length} выполнено
        </p>
        <div className="checklist-items">
          {items.length === 0 ? (
            <p>Список пуст. Добавьте первый пункт выше.</p>
          ) : (
            items.map((item) => (
              <FullWidthButton
                key={item.id}
                title={`${item.id === selectedId ? 'Выбран · ' : ''}${item.completed ? 'Готово · ' : ''}${item.text}`}
                ariaLabel={`${item.completed ? 'Снять отметку' : 'Отметить выполненным'}: ${item.text}`}
                onActivate={() => toggleItem(item.id)}
              />
            ))
          )}
        </div>

        <div className="action-list">
          <FullWidthButton
            title="Следующий невыполненный пункт"
            onActivate={() => {
              const next = findNextIncompleteItem(items, selectedId);
              setSelectedId(next?.id ?? null);
              setStatusMessage(
                next ? `Следующий пункт: ${next.text}` : 'Невыполненных пунктов нет.',
              );
            }}
          />
          {confirmReset ? (
            <>
              <p role="status">Удалить все пункты? Это действие нельзя отменить.</p>
              <FullWidthButton title="Да, очистить список" onActivate={resetItems} />
              <FullWidthButton title="Отмена очистки" onActivate={() => setConfirmReset(false)} />
            </>
          ) : (
            <FullWidthButton
              title="Сбросить список"
              onActivate={() => setConfirmReset(true)}
              disabled={items.length === 0}
            />
          )}
          <FullWidthButton title="Назад на главный экран" onActivate={goBack} />
        </div>
        {persistenceNotice && (
          <p className="status-message" role="status">{persistenceNotice}</p>
        )}
        {statusMessage && <p className="status-message" role="status">{statusMessage}</p>}
      </main>
    </Page>
  );

  const renderControls = () => (
    <Page headerText="Проверка управления" className="studio-page">
      <main className="screen-content" data-testid="controls-screen">
        <p>Стрелки перемещают фокус. Enter активирует выбранную кнопку.</p>
        <p data-testid="focused-control">Сейчас выбрано: {focusedControl}</p>
        <p className="control-result" role="status" data-testid="control-result">
          {lastControl}
        </p>
        <p data-testid="control-activations">{controlActivations}</p>
        <div className="action-list">
          {['Вверх', 'Вниз', 'Влево', 'Вправо'].map((direction) => (
            <FullWidthButton
              key={direction}
              title={direction}
              onStateChange={(_previous, next) => {
                if (next.state === State.FOCUSED) {
                  setFocusedControl(direction);
                }
              }}
              onActivate={() => {
                setLastControl(`Выбрано: ${direction}`);
                setControlActivations((count) => count + 1);
              }}
            />
          ))}
          <FullWidthButton title="Назад на главный экран" onActivate={goBack} />
        </div>
      </main>
    </Page>
  );

  const renderInfo = () => (
    <Page headerText="О приложении" className="studio-page">
      <main className="screen-content" data-testid="info-screen">
        <dl className="info-list">
          <div><dt>Версия</dt><dd>{packageJson.version}</dd></div>
          <div><dt>Сеть браузера</dt><dd>{isOnline ? 'Подключение есть' : 'Офлайн'}</dd></div>
          <div><dt>Локальное хранилище</dt><dd>{hasStorage ? 'Доступно' : 'Недоступно'}</dd></div>
          <div><dt>Безопасный контекст</dt><dd>{window.isSecureContext ? 'Да' : 'Нет'}</dd></div>
        </dl>
        <p>Состояние сети — только подсказка браузера, не проверка доступа в интернет.</p>
        <p>Камера, микрофон и датчики в этой версии не запрашиваются и не используются.</p>
        <FullWidthButton title="Назад на главный экран" onActivate={goBack} />
      </main>
    </Page>
  );

  return (
    <ToolkitApp>
      {screen === 'home' && renderHome()}
      {screen === 'checklist' && renderChecklist()}
      {screen === 'controls' && renderControls()}
      {screen === 'info' && renderInfo()}
      {screen === 'mock-stream' && <MockStreamScreen onBack={goBack} />}
    </ToolkitApp>
  );
}
