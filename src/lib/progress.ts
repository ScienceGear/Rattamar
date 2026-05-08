import type { SubjectKey } from "./quizData";

export interface ProgressData {
  correctCounts: Record<number, number>;
  incorrectCounts: Record<number, number>;
  mastered: number[];
  xp: number;
  totalCorrect: number;
  totalAttempts: number;
}

export interface LastSession {
  subjectKey: SubjectKey;
  idx: number;
}

const PROGRESS_KEY = (k: SubjectKey) => `rattamar_progress_${k}`;
const LAST_KEY = "rattamar_lastSession";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function safeGet<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function safeSet(key: string, val: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage disabled */
  }
}

export function loadProgress(key: SubjectKey): ProgressData {
  const raw = safeGet<ProgressData>(PROGRESS_KEY(key));
  return {
    correctCounts: raw?.correctCounts ?? {},
    incorrectCounts: raw?.incorrectCounts ?? {},
    mastered: raw?.mastered ?? [],
    xp: raw?.xp ?? 0,
    totalCorrect: raw?.totalCorrect ?? 0,
    totalAttempts: raw?.totalAttempts ?? 0,
  };
}
export function saveProgress(key: SubjectKey, data: ProgressData) {
  safeSet(PROGRESS_KEY(key), data);
}
export function resetProgress(key: SubjectKey) {
  safeSet(PROGRESS_KEY(key), {
    correctCounts: {},
    incorrectCounts: {},
    mastered: [],
    xp: 0,
    totalCorrect: 0,
    totalAttempts: 0,
  });
}

export function loadLast(): LastSession | null {
  return safeGet<LastSession>(LAST_KEY);
}
export function saveLast(s: LastSession | null) {
  safeSet(LAST_KEY, s);
}

export function getBadge(pct: number) {
  if (pct >= 100) return { name: "Master", className: "bg-warning text-warning-foreground" };
  if (pct >= 75) return { name: "Expert", className: "bg-primary text-primary-foreground" };
  if (pct >= 50) return { name: "Scholar", className: "bg-accent text-accent-foreground" };
  if (pct >= 25) return { name: "Learner", className: "bg-secondary text-secondary-foreground" };
  return { name: "Newbie", className: "bg-muted text-muted-foreground" };
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffleArr<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
