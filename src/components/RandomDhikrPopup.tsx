import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationSystem } from '@/hooks/useNotifications';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const adhkarList = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "لا حول ولا قوة إلا بالله",
  "سبحان الله وبحمده، سبحان الله العظيم",
  "أستغفر الله وأتوب إليه",
  "اللهم صل وسلم على نبينا محمد",
  "حسبي الله لا إله إلا هو عليه توكلت",
  "يا حي يا قيوم برحمتك أستغيث",
  "اللهم إنك عفو تحب العفو فاعف عني",
  "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته"
];

export function RandomDhikrPopup() {
  const { settings, setSettings, sendNotification } = useNotificationSystem();
  const [currentDhikr, setCurrentDhikr] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const navigate = useNavigate();
  
  const lastDhikrRef = useRef<string | null>(null);
  const ignoreCountRef = useRef(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest settings and functions in refs to avoid dependency cycles
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const sendNotificationRef = useRef(sendNotification);
  useEffect(() => {
    sendNotificationRef.current = sendNotification;
  }, [sendNotification]);

  const closePopup = useCallback(() => {
    setCurrentDhikr(null);
    setShowSuggestion(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const handleInteraction = () => {
    ignoreCountRef.current = 0;
    closePopup();
  };

  useEffect(() => {
    if (!settings.randomDhikrPopup) {
      closePopup();
      return;
    }

    let mainTimer: NodeJS.Timeout;

    const triggerPopup = () => {
      const s = settingsRef.current;

      // Check Quiet Hours
      if (s.quietHoursEnabled) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = (s.quietHoursStart || '22:00').split(':').map(Number);
        const [endH, endM] = (s.quietHoursEnd || '05:00').split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        let isQuiet = false;
        if (startMinutes <= endMinutes) {
          isQuiet = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        } else {
          isQuiet = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }

        if (isQuiet) {
          scheduleNext();
          return;
        }
      }

      // Get random dhikr
      let dhikr;
      do {
        dhikr = adhkarList[Math.floor(Math.random() * adhkarList.length)];
      } while (dhikr === lastDhikrRef.current && adhkarList.length > 1);
      lastDhikrRef.current = dhikr;

      // Activity Mode
      if (s.dhikrMode === 'activity' && document.hidden) {
        sendNotificationRef.current('ذكر الله', { body: dhikr });
        scheduleNext();
        return;
      }

      setCurrentDhikr(dhikr);

      // Auto hide
      const duration = s.dhikrDuration !== undefined ? s.dhikrDuration : 10;
      if (duration > 0) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setCurrentDhikr(null);
          ignoreCountRef.current += 1;
          
          if (ignoreCountRef.current >= 3) {
            setShowSuggestion(true);
            ignoreCountRef.current = 0;
          }
        }, duration * 1000);
      }

      scheduleNext();
    };

    const scheduleNext = () => {
      const s = settingsRef.current;
      const interval = s.dhikrInterval || 30;
      let nextMs = interval * 60 * 1000;

      if (s.dhikrMode === 'random') {
        const min = interval * 0.5;
        const max = interval * 1.5;
        nextMs = (Math.random() * (max - min) + min) * 60 * 1000;
      }

      // Safety fallback to prevent infinite loops (minimum 1 minute)
      if (isNaN(nextMs) || nextMs < 60000) {
        nextMs = 30 * 60 * 1000;
      }

      mainTimer = setTimeout(triggerPopup, nextMs);
    };

    // Start the cycle
    scheduleNext();

    return () => {
      if (mainTimer) clearTimeout(mainTimer);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [settings.randomDhikrPopup, settings.dhikrInterval, settings.dhikrMode, closePopup]);

  return (
    <AnimatePresence>
      {currentDhikr && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm"
          dir="rtl"
        >
          {/* Smart Suggestion */}
          {showSuggestion && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 text-sm font-tajawal flex items-start gap-3"
            >
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 mb-2">
                  لاحظنا انشغالك.. هل تود تقليل تكرار الأذكار لتناسب وقتك بشكل أفضل؟
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSettings(prev => ({ ...prev, dhikrInterval: Math.min(120, (prev.dhikrInterval || 30) + 15) }));
                      setShowSuggestion(false);
                    }}
                    className="bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors"
                  >
                    تقليل التكرار
                  </button>
                  <button 
                    onClick={() => {
                      setShowSuggestion(false);
                      navigate('/settings');
                    }}
                    className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    الإعدادات
                  </button>
                </div>
              </div>
              <button onClick={() => setShowSuggestion(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </motion.div>
          )}

          {/* Main Dhikr Popup */}
          <div 
            className="bg-black/70 dark:bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-black/80 transition-colors group"
            onClick={handleInteraction}
          >
            <div className="w-2 h-2 rounded-full bg-gold/80 animate-pulse shadow-[0_0_8px_rgba(200,169,81,0.6)]" />
            <p className="font-amiri text-xl text-white flex-1 text-center leading-relaxed">
              {currentDhikr}
            </p>
            {(settings.dhikrDuration === 0) && (
              <button 
                onClick={(e) => { e.stopPropagation(); closePopup(); }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
