import { useLocalStorage } from './useLocalStorage';

export interface KhatmaState {
  isActive: boolean;
  startDate: string | null;
  targetDays: number;
  completedPages: number;
  lastReadDate: string | null;
  dailyGoal: number;
}

const defaultKhatma: KhatmaState = {
  isActive: false,
  startDate: null,
  targetDays: 30,
  completedPages: 0,
  lastReadDate: null,
  dailyGoal: 0,
};

export function useKhatma() {
  const [khatma, setKhatma] = useLocalStorage<KhatmaState>('khatmaState', defaultKhatma);

  const startKhatma = (days: number) => {
    setKhatma({
      isActive: true,
      startDate: new Date().toISOString(),
      targetDays: days,
      completedPages: 0,
      lastReadDate: null,
      dailyGoal: Math.ceil(604 / days),
    });
  };

  const updateProgress = (pagesRead: number) => {
    setKhatma(prev => {
      if (!prev.isActive) return prev;
      const newCompleted = Math.min(604, prev.completedPages + pagesRead);
      
      const start = new Date(prev.startDate!);
      const today = new Date();
      const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
      const daysRemaining = Math.max(1, prev.targetDays - daysPassed);
      
      const newDailyGoal = Math.ceil((604 - newCompleted) / daysRemaining);

      return {
        ...prev,
        completedPages: newCompleted,
        lastReadDate: today.toISOString(),
        dailyGoal: newDailyGoal,
        isActive: newCompleted < 604,
      };
    });
  };

  const markTodayCompleted = () => {
    if (khatma.isActive && khatma.dailyGoal > 0) {
      updateProgress(khatma.dailyGoal);
    }
  };

  const cancelKhatma = () => {
    setKhatma(defaultKhatma);
  };

  return { khatma, startKhatma, updateProgress, markTodayCompleted, cancelKhatma };
}
