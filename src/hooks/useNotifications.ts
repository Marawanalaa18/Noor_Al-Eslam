import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { usePrayerTimes } from './usePrayerTimes';

export interface NotificationSettings {
  enabled: boolean;
  khatmaReminder: boolean;
  khatmaTime: string;
  morningAdhkar: boolean;
  morningAdhkarTime: string;
  eveningAdhkar: boolean;
  eveningAdhkarTime: string;
  prayerAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  randomDhikrPopup: boolean;
  dhikrInterval: number;
  dhikrMode: 'fixed' | 'random' | 'activity';
  dhikrDuration: number;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  khatmaReminder: true,
  khatmaTime: '20:00',
  morningAdhkar: true,
  morningAdhkarTime: '06:00',
  eveningAdhkar: true,
  eveningAdhkarTime: '17:00',
  prayerAlerts: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '05:00',
  randomDhikrPopup: true,
  dhikrInterval: 30,
  dhikrMode: 'fixed',
  dhikrDuration: 10,
};

export function useNotificationSystem() {
  const [storedSettings, setSettings] = useLocalStorage<NotificationSettings>('notificationSettings', defaultSettings);
  const settings = { ...defaultSettings, ...storedSettings };
  const { timings } = usePrayerTimes();
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('متصفحك لا يدعم الإشعارات الخارجية، سيتم تفعيل التنبيهات داخل التطبيق فقط.');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }

      if (Notification.permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      } else {
        alert('تم منع الإشعارات من المتصفح (أو بسبب بيئة العرض). سيتم تفعيل التنبيهات داخل التطبيق فقط.');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }
    } catch (error) {
      console.warn('Notification permission error:', error);
      setSettings(prev => ({ ...prev, enabled: true }));
      return true;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (settings.enabled) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            icon: '/favicon.ico', // Fallback icon
            ...options
          });
        } catch (e) {
          console.error('Failed to send native notification', e);
        }
      } else {
        console.log(`🔔 إشعار جديد: ${title} - ${options?.body}`);
      }
    }
  };

  useEffect(() => {
    if (!settings.enabled) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayDate = now.toISOString().slice(0, 10);

      // Check Quiet Hours
      if (settings.quietHoursEnabled) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
        const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        let isQuiet = false;
        if (startMinutes <= endMinutes) {
          isQuiet = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        } else {
          // Crosses midnight
          isQuiet = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }

        if (isQuiet) return; // Do not send notifications
      }

      // Helper to check and notify
      const checkAndNotify = (id: string, time: string, title: string, body: string) => {
        const notifKey = `${todayDate}-${id}`;
        if (time === currentTime && !notifiedRef.current.has(notifKey)) {
          sendNotification(title, { body });
          notifiedRef.current.add(notifKey);
        }
      };

      if (settings.khatmaReminder) {
        checkAndNotify('khatma', settings.khatmaTime, 'تذكير بالورد اليومي', 'حان وقت قراءة وردك اليومي من القرآن الكريم 📖');
      }

      if (settings.morningAdhkar) {
        checkAndNotify('morning', settings.morningAdhkarTime, 'أذكار الصباح', 'ابدأ يومك بذكر الله ☀️');
      }

      if (settings.eveningAdhkar) {
        checkAndNotify('evening', settings.eveningAdhkarTime, 'أذكار المساء', 'اختم يومك بذكر الله 🌙');
      }

      if (settings.prayerAlerts && timings) {
        // Check 10 mins before prayers
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNamesAr: Record<string, string> = {
          Fajr: 'الفجر',
          Dhuhr: 'الظهر',
          Asr: 'العصر',
          Maghrib: 'المغرب',
          Isha: 'العشاء'
        };

        prayers.forEach(prayer => {
          const prayerTimeStr = timings[prayer as keyof typeof timings];
          if (prayerTimeStr) {
            // Parse prayer time
            const [pH, pM] = prayerTimeStr.split(':').map(Number);
            const prayerDate = new Date(now);
            prayerDate.setHours(pH, pM, 0, 0);
            
            // Subtract 10 mins
            prayerDate.setMinutes(prayerDate.getMinutes() - 10);
            
            const alertTime = `${prayerDate.getHours().toString().padStart(2, '0')}:${prayerDate.getMinutes().toString().padStart(2, '0')}`;
            
            checkAndNotify(`prayer-${prayer}`, alertTime, 'تنبيه الصلاة', `اقترب موعد صلاة ${prayerNamesAr[prayer]} (متبقي 10 دقائق) 🕌`);
          }
        });
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [settings, timings]);

  return { settings, setSettings, requestPermission, sendNotification };
}
