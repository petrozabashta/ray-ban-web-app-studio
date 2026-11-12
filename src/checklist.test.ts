import { describe, expect, it } from 'vitest';
import {
  createChecklistItem,
  findNextIncompleteItem,
  parseChecklist,
  toggleChecklistItem,
  type ChecklistItem,
} from './checklist';

const items: ChecklistItem[] = [
  { id: 'one', text: 'Первый', completed: true },
  { id: 'two', text: 'Второй', completed: false },
  { id: 'three', text: 'Третий', completed: false },
];

describe('checklist helpers', () => {
  it('uses a starter task when storage has no saved data', () => {
    expect(parseChecklist(null).items).toEqual([
      { id: 'welcome-check', text: 'Открыть чек-лист', completed: false },
    ]);
  });

  it('reports malformed or invalid stored data without throwing', () => {
    expect(parseChecklist('{broken').warning).toContain('повреждён');
    expect(parseChecklist('[{"id":2}]').warning).toContain('повреждён');
  });

  it('trims valid tasks and rejects empty or overlong tasks', () => {
    expect(createChecklistItem('  Проверить UI  ', 'new')).toEqual({
      id: 'new',
      text: 'Проверить UI',
      completed: false,
    });
    expect(createChecklistItem('  ', 'empty')).toBeNull();
    expect(createChecklistItem('x'.repeat(81), 'long')).toBeNull();
  });

  it('toggles only the requested item', () => {
    expect(toggleChecklistItem(items, 'two')[1].completed).toBe(true);
    expect(toggleChecklistItem(items, 'missing')).toEqual(items);
  });

  it('finds the next incomplete item and wraps around', () => {
    expect(findNextIncompleteItem(items, 'two')?.id).toBe('three');
    expect(findNextIncompleteItem(items, 'three')?.id).toBe('two');
    expect(findNextIncompleteItem(items, null)?.id).toBe('two');
  });
});
