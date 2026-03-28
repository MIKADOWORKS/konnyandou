export type ReadingType = 'tarot-single' | 'tarot-spread' | 'zodiac';

export interface HistoryEntry {
  id: string;
  type: ReadingType;
  timestamp: number;
  reading: string;
  // Tarot single
  cardName?: string;
  cardNameEn?: string;
  cardEmoji?: string;
  isReversed?: boolean;
  question?: string;
  // Tarot spread
  spreadCards?: {
    position: string;
    cardName: string;
    cardEmoji: string;
    isReversed: boolean;
  }[];
  // Zodiac
  sign?: string;
  signIcon?: string;
  overall?: number;
  categories?: { label: string; stars: number }[];
}

const STORAGE_KEY = 'konnyandou-history';
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
