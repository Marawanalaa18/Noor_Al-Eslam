import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, BarChart3, Heart, Star, Activity, Plus, Minus, Target, BookOpen } from 'lucide-react';
import { useDailyTracker, DailyTrackerState } from '@/hooks/useDailyTracker';
import { cn } from '@/utils/cn';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Progress } from './Progress';
import { Khatma } from './Khatma';

const PRAYERS = [
  { id: 'fajr', name: 'الفجر' },
  { id: 'dhuhr', name: 'الظهر' },
  { id: 'asr', name: 'العصر' },
  { id: 'maghrib', name: 'المغرب' },
  { id: 'isha', name: 'العشاء' },
] as const;

const EXTRA_PRAYERS = [
  { id: 'qiyam', name: 'قيام الليل' },
  { id: 'shuruq', name: 'صلاة الشروق' },
  { id: 'duha', name: 'صلاة الضحى' },
] as const;

const ADHKAR = [
  { id: 'morning', name: 'أذكار الصباح' },
  { id: 'evening', name: 'أذكار المساء' },
  { id: 'dailyDhikr', name: 'ذكر اليوم' },
  { id: 'dailyDua', name: 'دعاء اليوم' },
] as const;

const DEEDS = [
  { id: 'charity', name: 'صدقة' },
  { id: 'parents', name: 'بر الوالدين' },
  { id: 'prayForMuslims', name: 'دعاء للمسلمين' },
  { id: 'visitSick', name: 'زيارة مريض' },
  { id: 'lowerGaze', name: 'غض البصر' },
  { id: 'guardTongue', name: 'حفظ اللسان' },
  { id: 'feedPoor', name: 'إطعام مسكين' },
  { id: 'reading', name: 'قراءة وإطلاع' },
] as const;

const JANNAH_ADHKAR = [
  { id: 'subhan_allah', text: 'سبحان الله', points: 1 },
  { id: 'alhamdulillah', text: 'الحمد لله', points: 1 },
  { id: 'la_ilaha_illallah', text: 'لا إله إلا الله', points: 1 },
  { id: 'Allahu_akbar', text: 'الله أكبر', points: 1 },
  { id: 'subhan_allah_wabihamdih', text: 'سبحان الله وبحمده', points: 1 },
  { id: 'astaghfirullah', text: 'أستغفر الله', points: 1 },
  { id: 'salat_nabi', text: 'الصلاة على النبي', points: 1 },
];

export function Tracker() {
  const { getDayData, updateDayData, getTodayDateString, trackerData, addJannahDhikr } = useDailyTracker();
  const [currentDateStr, setCurrentDateStr] = useState(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'daily' | 'jannah' | 'stats' | 'progress' | 'khatma'>('daily');

  const currentDate = new Date(currentDateStr);
  const dayData = getDayData(currentDateStr);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    const offset = prev.getTimezoneOffset() * 60000;
    setCurrentDateStr((new Date(prev.getTime() - offset)).toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    const offset = next.getTimezoneOffset() * 60000;
    setCurrentDateStr((new Date(next.getTime() - offset)).toISOString().slice(0, 10));
  };

  const isToday = currentDateStr === getTodayDateString();

  const togglePrayer = (prayerId: keyof DailyTrackerState['prayers'], field: keyof DailyTrackerState['prayers']['fajr']) => {
    updateDayData(currentDateStr, prev => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayerId]: {
          ...prev.prayers[prayerId],
          [field]: !prev.prayers[prayerId][field]
        }
      }
    }));
  };

  const toggleExtraPrayer = (id: keyof DailyTrackerState['extraPrayers']) => {
    updateDayData(currentDateStr, prev => ({
      ...prev,
      extraPrayers: { ...prev.extraPrayers, [id]: !prev.extraPrayers[id] }
    }));
  };

  const toggleAdhkar = (id: keyof DailyTrackerState['adhkar']) => {
    updateDayData(currentDateStr, prev => ({
      ...prev,
      adhkar: { ...prev.adhkar, [id]: !prev.adhkar[id] }
    }));
  };

  const toggleFasting = () => {
    updateDayData(currentDateStr, prev => ({ ...prev, fasting: !prev.fasting }));
  };

  const toggleDeed = (id: keyof DailyTrackerState['deeds']) => {
    updateDayData(currentDateStr, prev => ({
      ...prev,
      deeds: { ...prev.deeds, [id]: !prev.deeds[id] }
    }));
  };

  // Calculate Jannah Total Points
  const jannahTotal = useMemo(() => {
    return Object.entries(dayData.jannah).reduce((total, [id, count]) => {
      const dhikr = JANNAH_ADHKAR.find(d => d.id === id);
      return total + (dhikr ? dhikr.points * count : 0);
    }, 0);
  }, [dayData.jannah]);

  // Calculate Stats
  const stats = useMemo(() => {
    const today = new Date(getTodayDateString());
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - 6 + i);
      const offset = d.getTimezoneOffset() * 60000;
      const dateStr = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
      const data = trackerData[dateStr];
      
      // Calculate a score for the day
      let score = 0;
      if (data) {
        Object.values(data.prayers).forEach((p: any) => {
          if (p.fard) score += 10;
          if (p.sunnah) score += 5;
          if (p.masjid) score += 5;
          if (p.quran) score += 5;
        });
        Object.values(data.extraPrayers).forEach(p => { if (p) score += 10; });
        Object.values(data.adhkar).forEach(a => { if (a) score += 5; });
        if (data.fasting) score += 20;
        Object.values(data.deeds).forEach(d => { if (d) score += 5; });
        
        // Add Jannah points (scaled down)
        const jTotal = Object.entries(data.jannah).reduce((t, [id, c]) => {
          const dhikr = JANNAH_ADHKAR.find(d => d.id === id);
          return t + (dhikr ? dhikr.points * (c as number) : 0);
        }, 0);
        score += Math.min(50, Math.floor(jTotal / 100)); // Max 50 points from Jannah
      }
      
      return {
        name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        score,
        dateStr
      };
    });

    const yesterdayStr = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      const offset = d.getTimezoneOffset() * 60000;
      return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    })();
    const yesterdayScore = last7Days.find(d => d.dateStr === yesterdayStr)?.score || 0;

    return { last7Days, yesterdayScore };
  }, [trackerData, getTodayDateString]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
      dir="rtl"
    >
      {['daily', 'jannah', 'stats'].includes(activeTab) && (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-amiri text-gradient">المتابعة اليومية</h1>
          <p className="text-gray-500 dark:text-gray-400 font-tajawal">
            حاسبوا أنفسكم قبل أن تحاسبوا
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-2 bg-gray-100 dark:bg-surface-dark p-1.5 rounded-2xl w-fit mx-auto flex-wrap">
        <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={<Activity className="w-4 h-4" />}>اليوم</TabButton>
        <TabButton active={activeTab === 'jannah'} onClick={() => setActiveTab('jannah')} icon={<Star className="w-4 h-4" />}>ابنِ جنتك</TabButton>
        <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 className="w-4 h-4" />}>إحصائيات</TabButton>
        <TabButton active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={<Target className="w-4 h-4" />}>لوحة التقدم</TabButton>
        <TabButton active={activeTab === 'khatma'} onClick={() => setActiveTab('khatma')} icon={<BookOpen className="w-4 h-4" />}>الختمة الذكية</TabButton>
      </div>

      {/* Date Navigator (Only for Daily & Jannah) */}
      {['daily', 'jannah'].includes(activeTab) && (
        <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold font-tajawal text-gray-800 dark:text-gray-100">
              {isToday ? 'اليوم' : currentDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
          </div>
          <button 
            onClick={handleNextDay} 
            disabled={isToday}
            className={cn("p-2 rounded-full transition-colors", isToday ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/5")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Prayers Section */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold font-amiri text-primary dark:text-gold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 dark:bg-gold/10 flex items-center justify-center">1</span>
              الصلاة
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10">
                    <th className="pb-4 font-tajawal text-gray-500 dark:text-gray-400 font-medium">الصلاة</th>
                    <th className="pb-4 font-tajawal text-gray-500 dark:text-gray-400 font-medium">الفريضة</th>
                    <th className="pb-4 font-tajawal text-gray-500 dark:text-gray-400 font-medium">النافلة</th>
                    <th className="pb-4 font-tajawal text-gray-500 dark:text-gray-400 font-medium">المسجد</th>
                    <th className="pb-4 font-tajawal text-gray-500 dark:text-gray-400 font-medium">ورد القرآن</th>
                  </tr>
                </thead>
                <tbody>
                  {PRAYERS.map((prayer) => (
                    <tr key={prayer.id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold font-tajawal text-gray-800 dark:text-gray-200">{prayer.name}</td>
                      <td className="py-4"><ToggleButton active={dayData.prayers[prayer.id].fard} onClick={() => togglePrayer(prayer.id, 'fard')} /></td>
                      <td className="py-4"><ToggleButton active={dayData.prayers[prayer.id].sunnah} onClick={() => togglePrayer(prayer.id, 'sunnah')} /></td>
                      <td className="py-4"><ToggleButton active={dayData.prayers[prayer.id].masjid} onClick={() => togglePrayer(prayer.id, 'masjid')} /></td>
                      <td className="py-4"><ToggleButton active={dayData.prayers[prayer.id].quran} onClick={() => togglePrayer(prayer.id, 'quran')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              {EXTRA_PRAYERS.map(prayer => (
                <button
                  key={prayer.id}
                  onClick={() => toggleExtraPrayer(prayer.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-tajawal font-bold text-sm transition-all flex items-center gap-2",
                    dayData.extraPrayers[prayer.id] 
                      ? "bg-primary text-white shadow-md shadow-primary/20 dark:bg-gold dark:text-black dark:shadow-gold/20" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  )}
                >
                  {dayData.extraPrayers[prayer.id] && <CheckCircle2 className="w-4 h-4" />}
                  {prayer.name}
                </button>
              ))}
            </div>
          </div>

          {/* Adhkar & Fasting */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold font-amiri text-primary dark:text-gold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 dark:bg-gold/10 flex items-center justify-center">2</span>
              الصيام والأذكار
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="font-bold font-tajawal text-gray-800 dark:text-gray-200">الصيام</span>
                <ToggleButton active={dayData.fasting} onClick={toggleFasting} size="lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {ADHKAR.map(dhikr => (
                  <div key={dhikr.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <span className="font-bold font-tajawal text-gray-800 dark:text-gray-200">{dhikr.name}</span>
                    <ToggleButton active={dayData.adhkar[dhikr.id]} onClick={() => toggleAdhkar(dhikr.id)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Good Deeds */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-amiri text-primary dark:text-gold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 dark:bg-gold/10 flex items-center justify-center">3</span>
                عبادات متنوعة
              </h3>
              <span className="text-sm font-tajawal text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                {Object.values(dayData.deeds).filter(Boolean).length} / {DEEDS.length}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {DEEDS.map(deed => (
                <button
                  key={deed.id}
                  onClick={() => toggleDeed(deed.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-300 border-2",
                    dayData.deeds[deed.id]
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    dayData.deeds[deed.id] ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                  )}>
                    {dayData.deeds[deed.id] ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <span className={cn(
                    "font-bold font-tajawal text-sm text-center",
                    dayData.deeds[deed.id] ? "text-emerald-700 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {deed.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jannah' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between bg-gradient-to-r from-primary/5 to-gold/5 border-primary/10">
            <div>
              <h3 className="text-xl font-bold font-amiri text-gray-800 dark:text-gray-100 mb-1">إجمالي الحسنات اليوم</h3>
              <p className="text-sm text-gray-500 font-tajawal">والله يضاعف لمن يشاء</p>
            </div>
            <div className="text-4xl font-bold font-mono text-primary dark:text-gold">
              {jannahTotal.toLocaleString('ar-EG')}
            </div>
          </div>

          <div className="space-y-4">
            {JANNAH_ADHKAR.map(dhikr => {
              const count = dayData.jannah[dhikr.id] || 0;
              return (
                <div key={dhikr.id} className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-right flex-1">
                    <h4 className="font-bold font-amiri text-xl text-gray-800 dark:text-gray-100 mb-1">{dhikr.text}</h4>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <CustomAddInput onAdd={(amount) => addJannahDhikr(currentDateStr, dhikr.id, amount)} />
                    <JannahCounter count={count} onClick={() => addJannahDhikr(currentDateStr, dhikr.id, 1)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-3xl text-center">
              <h3 className="text-gray-500 dark:text-gray-400 font-tajawal mb-2">نقاط الأمس</h3>
              <div className="text-4xl font-bold font-mono text-primary dark:text-gold">
                {stats.yesterdayScore}
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl text-center">
              <h3 className="text-gray-500 dark:text-gray-400 font-tajawal mb-2">متوسط آخر 7 أيام</h3>
              <div className="text-4xl font-bold font-mono text-blue-500">
                {Math.round(stats.last7Days.reduce((sum, d) => sum + d.score, 0) / 7)}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-xl font-bold font-amiri text-gray-800 dark:text-gray-100 mb-6">أداء آخر 7 أيام</h3>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {stats.last7Days.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.dateStr === getTodayDateString() ? '#C8A951' : '#0F3D2E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && <Progress />}
      {activeTab === 'khatma' && <Khatma />}
    </motion.div>
  );
}

function TabButton({ active, onClick, children, icon }: { active: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-tajawal text-sm transition-all duration-300",
        active 
          ? "bg-white dark:bg-[#1a1a1a] text-primary dark:text-gold shadow-sm" 
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CustomAddInput({ onAdd }: { onAdd: (amount: number) => void }) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const val = parseInt(value);
    if (!isNaN(val) && val > 0) {
      onAdd(val);
      setValue('');
    }
  };

  return (
    <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-gray-100 dark:border-white/10 focus-within:border-primary/50 dark:focus-within:border-gold/50 transition-colors">
      <input 
        type="number" 
        min="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="عدد"
        className="w-16 bg-transparent border-none text-center font-mono text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAdd();
          }
        }}
      />
      <button 
        onClick={handleAdd}
        disabled={!value || parseInt(value) <= 0}
        className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold hover:bg-primary/20 dark:hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

const JannahCounter = ({ count, onClick }: { count: number, onClick: () => void }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (count % 100) / 100;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 outline-none hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-gray-100 dark:text-gray-800"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-primary dark:text-gold transition-colors duration-300"
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono text-primary dark:text-gold">{count}</span>
      </div>
    </motion.button>
  );
};

function ToggleButton({ active, onClick, size = 'md' }: { active: boolean, onClick: () => void, size?: 'md' | 'lg' }) {
  const isLg = size === 'lg';
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full transition-all duration-300 flex items-center justify-center mx-auto",
        isLg ? "w-10 h-10" : "w-8 h-8",
        active 
          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110" 
          : "bg-gray-200 dark:bg-gray-700 text-transparent hover:bg-gray-300 dark:hover:bg-gray-600"
      )}
    >
      <CheckCircle2 className={cn(isLg ? "w-6 h-6" : "w-5 h-5", active ? "opacity-100" : "opacity-0")} />
    </button>
  );
}
