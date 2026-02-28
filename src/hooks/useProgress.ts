import { useLocalStorage } from './useLocalStorage';

export interface DailyStats {
  [date: string]: number;
}

export interface UserProgress {
  dailyPages: DailyStats;
  completedJuzs: number[];
  totalAdhkar: number;
  readingMinutes: DailyStats;
  lastActiveDate: string | null;
  streak: number;
  bestStreak: number;
  nightDhikrCount: number;
  appOpens: number;
  fajrWakeups: number;
  strongReturns: number;
  sharesCount: number;
}

const defaultProgress: UserProgress = {
  dailyPages: {},
  completedJuzs: [],
  totalAdhkar: 0,
  readingMinutes: {},
  lastActiveDate: null,
  streak: 0,
  bestStreak: 0,
  nightDhikrCount: 0,
  appOpens: 0,
  fajrWakeups: 0,
  strongReturns: 0,
  sharesCount: 0,
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', defaultProgress);

  const getTodayDateString = () => {
    const today = new Date();
    // Use local date string
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().slice(0, 10);
    return localISOTime;
  };

  const updateActivity = () => {
    const today = getTodayDateString();
    setProgress((prev) => {
      const newProgress = { ...defaultProgress, ...prev };
      
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const offset = yesterday.getTimezoneOffset() * 60000;
        const yesterdayStr = (new Date(yesterday.getTime() - offset)).toISOString().slice(0, 10);

        if (prev.lastActiveDate === yesterdayStr) {
          newProgress.streak += 1;
        } else if (prev.lastActiveDate !== today) {
          // Check for strong return (break of > 3 days)
          if (prev.lastActiveDate) {
            const lastDate = new Date(prev.lastActiveDate);
            const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 3) {
              newProgress.strongReturns = (newProgress.strongReturns || 0) + 1;
            }
          }
          newProgress.streak = 1;
        }
        
        if (newProgress.streak > (newProgress.bestStreak || 0)) {
          newProgress.bestStreak = newProgress.streak;
        }
        
        newProgress.lastActiveDate = today;
      }
      return newProgress;
    });
  };

  const recordAppOpen = () => {
    setProgress((prev) => {
      const newProgress = { ...defaultProgress, ...prev };
      newProgress.appOpens = (newProgress.appOpens || 0) + 1;
      
      // Check for fajr wakeup (between 4 AM and 6 AM)
      const now = new Date();
      const hours = now.getHours();
      if (hours >= 4 && hours < 6) {
        // Only count once per day
        const today = getTodayDateString();
        // We can use a simple check, if lastActiveDate wasn't today before this open
        if (prev.lastActiveDate !== today) {
          newProgress.fajrWakeups = (newProgress.fajrWakeups || 0) + 1;
        }
      }
      
      return newProgress;
    });
    updateActivity();
  };

  const addPages = (count: number) => {
    const today = getTodayDateString();
    setProgress((prev) => {
      const newProgress = { ...prev };
      if (!newProgress.dailyPages) newProgress.dailyPages = {};
      newProgress.dailyPages[today] = (newProgress.dailyPages[today] || 0) + count;
      return newProgress;
    });
    updateActivity();
  };

  const addAdhkar = (count: number) => {
    setProgress((prev) => {
      const newProgress = { ...defaultProgress, ...prev };
      newProgress.totalAdhkar = (newProgress.totalAdhkar || 0) + count;
      
      // Check for night dhikr (between 00:00 and 04:00)
      const hours = new Date().getHours();
      if (hours >= 0 && hours < 4) {
        newProgress.nightDhikrCount = (newProgress.nightDhikrCount || 0) + count;
      }
      
      return newProgress;
    });
    updateActivity();
  };

  const addReadingTime = (minutes: number) => {
    const today = getTodayDateString();
    setProgress((prev) => {
      const newProgress = { ...prev };
      if (!newProgress.readingMinutes) newProgress.readingMinutes = {};
      newProgress.readingMinutes[today] = (newProgress.readingMinutes[today] || 0) + minutes;
      return newProgress;
    });
    updateActivity();
  };

  const markJuzCompleted = (juz: number) => {
    setProgress((prev) => {
      const newProgress = { ...defaultProgress, ...prev };
      if (!newProgress.completedJuzs) newProgress.completedJuzs = [];
      if (!newProgress.completedJuzs.includes(juz)) {
        return {
          ...newProgress,
          completedJuzs: [...newProgress.completedJuzs, juz]
        };
      }
      return newProgress;
    });
  };

  const recordShare = () => {
    setProgress((prev) => ({
      ...defaultProgress,
      ...prev,
      sharesCount: (prev.sharesCount || 0) + 1
    }));
  };

  return {
    progress: { ...defaultProgress, ...progress },
    addPages,
    addAdhkar,
    addReadingTime,
    markJuzCompleted,
    updateActivity,
    recordAppOpen,
    recordShare,
    getTodayDateString
  };
}
