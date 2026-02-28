import { useLocalStorage } from './useLocalStorage';

export interface DailyTrackerState {
  prayers: {
    fajr: { fard: boolean; sunnah: boolean; masjid: boolean; quran: boolean };
    dhuhr: { fard: boolean; sunnah: boolean; masjid: boolean; quran: boolean };
    asr: { fard: boolean; sunnah: boolean; masjid: boolean; quran: boolean };
    maghrib: { fard: boolean; sunnah: boolean; masjid: boolean; quran: boolean };
    isha: { fard: boolean; sunnah: boolean; masjid: boolean; quran: boolean };
  };
  extraPrayers: { duha: boolean; shuruq: boolean; qiyam: boolean };
  adhkar: { morning: boolean; evening: boolean; dailyDhikr: boolean; dailyDua: boolean };
  fasting: boolean;
  deeds: {
    charity: boolean;
    parents: boolean;
    prayForMuslims: boolean;
    visitSick: boolean;
    lowerGaze: boolean;
    guardTongue: boolean;
    feedPoor: boolean;
    reading: boolean;
  };
  jannah: Record<string, number>;
}

const defaultDailyState: DailyTrackerState = {
  prayers: {
    fajr: { fard: false, sunnah: false, masjid: false, quran: false },
    dhuhr: { fard: false, sunnah: false, masjid: false, quran: false },
    asr: { fard: false, sunnah: false, masjid: false, quran: false },
    maghrib: { fard: false, sunnah: false, masjid: false, quran: false },
    isha: { fard: false, sunnah: false, masjid: false, quran: false },
  },
  extraPrayers: { duha: false, shuruq: false, qiyam: false },
  adhkar: { morning: false, evening: false, dailyDhikr: false, dailyDua: false },
  fasting: false,
  deeds: {
    charity: false,
    parents: false,
    prayForMuslims: false,
    visitSick: false,
    lowerGaze: false,
    guardTongue: false,
    feedPoor: false,
    reading: false,
  },
  jannah: {},
};

export function useDailyTracker() {
  const [trackerData, setTrackerData] = useLocalStorage<Record<string, DailyTrackerState>>('noor-daily-tracker', {});

  const getTodayDateString = () => {
    const offset = new Date().getTimezoneOffset() * 60000;
    return (new Date(Date.now() - offset)).toISOString().slice(0, 10);
  };

  const getDayData = (dateStr: string): DailyTrackerState => {
    return trackerData[dateStr] || defaultDailyState;
  };

  const updateDayData = (dateStr: string, updater: (prev: DailyTrackerState) => DailyTrackerState) => {
    setTrackerData(prev => {
      const currentDayData = prev[dateStr] || defaultDailyState;
      return {
        ...prev,
        [dateStr]: updater(currentDayData)
      };
    });
  };

  const addJannahDhikr = (dateStr: string, dhikrId: string, count: number) => {
    updateDayData(dateStr, (prev) => ({
      ...prev,
      jannah: {
        ...prev.jannah,
        [dhikrId]: (prev.jannah[dhikrId] || 0) + count,
      }
    }));
  };

  return {
    trackerData,
    getDayData,
    updateDayData,
    getTodayDateString,
    addJannahDhikr
  };
}
