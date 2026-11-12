export const STORAGE_KEY = 'ray-ban-web-app-studio:checklist:v1';
export const MAX_ITEM_LENGTH = 80;
export const MAX_ITEM_COUNT = 50;

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistState {
  items: ChecklistItem[];
  warning: string | null;
}

const starterItems: ChecklistItem[] = [
  { id: 'welcome-check', text: 'Открыть чек-лист', completed: false },
];

export function parseChecklist(raw: string | null): ChecklistState {
  if (raw === null) {
    return { items: starterItems, warning: null };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      parsed.length > MAX_ITEM_COUNT ||
      !parsed.every(isChecklistItem)
    ) {
      return {
        items: [],
        warning: 'Сохранённый список повреждён. Создайте пункты заново.',
      };
    }

    return { items: parsed, warning: null };
  } catch {
    return {
      items: [],
      warning: 'Сохранённый список повреждён. Создайте пункты заново.',
    };
  }
}

export function createChecklistItem(text: string, id: string): ChecklistItem | null {
  const normalized = text.trim();
  if (!normalized || normalized.length > MAX_ITEM_LENGTH) {
    return null;
  }

  return { id, text: normalized, completed: false };
}

export function toggleChecklistItem(
  items: ChecklistItem[],
  id: string,
): ChecklistItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, completed: !item.completed } : item,
  );
}

export function findNextIncompleteItem(
  items: ChecklistItem[],
  currentId: string | null,
): ChecklistItem | null {
  const currentIndex = items.findIndex((item) => item.id === currentId);
  const startIndex = currentIndex < 0 ? 0 : currentIndex + 1;
  return (
    items.slice(startIndex).find((item) => !item.completed) ??
    items.find((item) => !item.completed) ??
    null
  );
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.text === 'string' &&
    item.text.trim().length > 0 &&
    item.text.length <= MAX_ITEM_LENGTH &&
    typeof item.completed === 'boolean'
  );
}
