import React from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, Moon, Sun, Clock, BookOpen, Settings2, Sparkles } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotifications';
import { cn } from '@/utils/cn';

export function Settings() {
  const { settings, setSettings, requestPermission } = useNotificationSystem();

  const handleToggleEnabled = async () => {
    if (!settings.enabled) {
      const granted = await requestPermission();
      if (!granted) return;
    } else {
      setSettings(prev => ({ ...prev, enabled: false }));
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
      dir="rtl"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">الإعدادات والإشعارات</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">
          تحكم في تنبيهاتك اليومية وأوقات التذكير
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8">
        {/* Main Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              settings.enabled ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold" : "bg-gray-100 text-gray-400 dark:bg-white/5"
            )}>
              {settings.enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">تفعيل الإشعارات</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal">السماح للتطبيق بإرسال تنبيهات</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.enabled} onChange={handleToggleEnabled} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
          </label>
        </div>

        {/* Notification Types */}
        <div className={cn("space-y-6 transition-opacity duration-300", !settings.enabled && "opacity-50 pointer-events-none")}>
          
          {/* Khatma */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">الورد اليومي</h3>
                <p className="text-xs text-gray-500 font-tajawal">تذكير بقراءة ورد القرآن</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="time" 
                value={settings.khatmaTime}
                onChange={(e) => updateSetting('khatmaTime', e.target.value)}
                className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.khatmaReminder} onChange={(e) => updateSetting('khatmaReminder', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>

          {/* Morning Adhkar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">أذكار الصباح</h3>
                <p className="text-xs text-gray-500 font-tajawal">تذكير بأذكار الصباح</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="time" 
                value={settings.morningAdhkarTime}
                onChange={(e) => updateSetting('morningAdhkarTime', e.target.value)}
                className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.morningAdhkar} onChange={(e) => updateSetting('morningAdhkar', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>

          {/* Evening Adhkar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">أذكار المساء</h3>
                <p className="text-xs text-gray-500 font-tajawal">تذكير بأذكار المساء</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="time" 
                value={settings.eveningAdhkarTime}
                onChange={(e) => updateSetting('eveningAdhkarTime', e.target.value)}
                className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.eveningAdhkar} onChange={(e) => updateSetting('eveningAdhkar', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>

          {/* Prayer Alerts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">تنبيهات الصلاة</h3>
                <p className="text-xs text-gray-500 font-tajawal">تنبيه قبل الصلاة بـ 10 دقائق</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.prayerAlerts} onChange={(e) => updateSetting('prayerAlerts', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>

          {/* Random Dhikr Popup */}
          <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <div>
                  <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">نافذة الذكر العشوائي</h3>
                  <p className="text-xs text-gray-500 font-tajawal">ظهور ذكر عشوائي في زاوية الشاشة</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.randomDhikrPopup} onChange={(e) => updateSetting('randomDhikrPopup', e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
                </label>
              </div>
            </div>

            {settings.randomDhikrPopup && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-6">
                {/* Interval Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200">الفترة الزمنية</span>
                    <span className="text-xs text-primary dark:text-gold font-tajawal bg-primary/10 dark:bg-gold/10 px-2 py-1 rounded-md">
                      سيظهر ذكر كل {settings.dhikrInterval} دقيقة
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="120" 
                    step="5"
                    value={settings.dhikrInterval}
                    onChange={(e) => updateSetting('dhikrInterval', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary dark:accent-gold"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-mono px-1">
                    <span>5</span>
                    <span>30</span>
                    <span>60</span>
                    <span>90</span>
                    <span>120</span>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-3">
                  <span className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200">وضع الظهور</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => updateSetting('dhikrMode', 'fixed')}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-tajawal transition-colors text-right",
                        settings.dhikrMode === 'fixed' 
                          ? "border-primary bg-primary/5 text-primary dark:border-gold dark:bg-gold/5 dark:text-gold" 
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="font-bold mb-1">ثابت</div>
                      <div className="text-xs opacity-80">يظهر كل {settings.dhikrInterval} دقيقة بالضبط</div>
                    </button>
                    <button
                      onClick={() => updateSetting('dhikrMode', 'random')}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-tajawal transition-colors text-right",
                        settings.dhikrMode === 'random' 
                          ? "border-primary bg-primary/5 text-primary dark:border-gold dark:bg-gold/5 dark:text-gold" 
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="font-bold mb-1">عشوائي ذكي</div>
                      <div className="text-xs opacity-80">يظهر في وقت غير متوقع (حول {settings.dhikrInterval} دقيقة)</div>
                    </button>
                    <button
                      onClick={() => updateSetting('dhikrMode', 'activity')}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-tajawal transition-colors text-right",
                        settings.dhikrMode === 'activity' 
                          ? "border-primary bg-primary/5 text-primary dark:border-gold dark:bg-gold/5 dark:text-gold" 
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="font-bold mb-1">حسب النشاط</div>
                      <div className="text-xs opacity-80">يظهر فقط أثناء استخدام التطبيق</div>
                    </button>
                  </div>
                </div>
                
                {/* Duration */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-tajawal text-gray-700 dark:text-gray-200">مدة البقاء</h4>
                    <p className="text-xs text-gray-500 font-tajawal">متى يختفي الذكر؟</p>
                  </div>
                  <select 
                    value={settings.dhikrDuration}
                    onChange={(e) => updateSetting('dhikrDuration', Number(e.target.value))}
                    className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-tajawal outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={5}>بعد 5 ثواني</option>
                    <option value={10}>بعد 10 ثواني</option>
                    <option value={15}>بعد 15 ثانية</option>
                    <option value={0}>حتى أقوم بإغلاقه</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Quiet Hours */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-bold font-tajawal text-gray-800 dark:text-gray-100">وقت النوم (عدم الإزعاج)</h3>
                  <p className="text-xs text-gray-500 font-tajawal">كتم الإشعارات في هذه الفترة</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.quietHoursEnabled} onChange={(e) => updateSetting('quietHoursEnabled', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-gold"></div>
              </label>
            </div>
            
            <div className={cn("flex flex-col sm:flex-row items-center gap-4 transition-opacity", !settings.quietHoursEnabled && "opacity-50 pointer-events-none")}>
              <div className="w-full flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between">
                <span className="text-sm font-tajawal text-gray-600 dark:text-gray-300">من</span>
                <input 
                  type="time" 
                  value={settings.quietHoursStart}
                  onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                  className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm font-mono outline-none"
                />
              </div>
              <div className="w-full flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between">
                <span className="text-sm font-tajawal text-gray-600 dark:text-gray-300">إلى</span>
                <input 
                  type="time" 
                  value={settings.quietHoursEnd}
                  onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                  className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm font-mono outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
