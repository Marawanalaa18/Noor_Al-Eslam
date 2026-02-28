import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, Clock, CheckCircle2, Target, AlertCircle, RefreshCw, Play, Share2 } from 'lucide-react';
import { useKhatma } from '@/hooks/useKhatma';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';
import { AchievementShareModal } from '@/components/AchievementShareModal';

export function Khatma() {
  const { khatma, startKhatma, markTodayCompleted, cancelKhatma } = useKhatma();
  const navigate = useNavigate();
  const [customMinutes, setCustomMinutes] = useState(15);
  const [shareAchievement, setShareAchievement] = useState<{ title: string, description: string } | null>(null);

  const handleStart = (days: number) => {
    startKhatma(days);
  };

  const handleCustomStart = () => {
    // Assume 1.5 minutes per page
    const pagesPerDay = Math.floor(customMinutes / 1.5);
    const days = Math.ceil(604 / pagesPerDay);
    startKhatma(days);
  };

  const schedule = useMemo(() => {
    if (!khatma.isActive || !khatma.startDate) return [];
    
    const start = new Date(khatma.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const currentDayIndex = Math.max(0, daysPassed);
    
    const daysRemaining = Math.max(1, khatma.targetDays - currentDayIndex);
    const pagesRemaining = 604 - khatma.completedPages;
    const newDailyGoal = Math.ceil(pagesRemaining / daysRemaining);

    const list = [];
    let currentPage = khatma.completedPages + 1;

    for (let i = 0; i < Math.min(7, daysRemaining); i++) {
      const isToday = i === 0;
      const pagesForThisDay = isToday ? newDailyGoal : Math.ceil((pagesRemaining - newDailyGoal) / Math.max(1, daysRemaining - 1));
      const endPage = Math.min(604, currentPage + pagesForThisDay - 1);
      
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      list.push({
        dayOffset: i,
        date,
        isToday,
        startPage: currentPage,
        endPage,
        pagesCount: endPage - currentPage + 1
      });

      currentPage = endPage + 1;
      if (currentPage > 604) break;
    }

    return list;
  }, [khatma]);

  const todaySchedule = schedule.find(s => s.isToday);
  const isCompletedToday = khatma.lastReadDate && new Date(khatma.lastReadDate).toDateString() === new Date().toDateString();

  const progressPercentage = Math.min(100, (khatma.completedPages / 604) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
      dir="rtl"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">الختمة الذكية</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">
          نظام جدولة مرن يتكيف مع وتيرة قراءتك
        </p>
      </div>

      {!khatma.isActive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 30 Days Plan */}
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/20">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100">ختمة شهرية</h3>
            <p className="text-gray-500 dark:text-gray-400 font-tajawal text-sm">
              جزء واحد يومياً (20 صفحة)
              <br/>المدة: 30 يوم
            </p>
            <button 
              onClick={() => handleStart(30)}
              className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors"
            >
              ابدأ الختمة
            </button>
          </div>

          {/* 10 Days Plan */}
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full">
              مكثفة
            </div>
            <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-2">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100">ختمة 10 أيام</h3>
            <p className="text-gray-500 dark:text-gray-400 font-tajawal text-sm">
              3 أجزاء يومياً (60 صفحة)
              <br/>المدة: 10 أيام
            </p>
            <button 
              onClick={() => handleStart(10)}
              className="mt-4 w-full py-3 bg-gold text-white rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/20"
            >
              ابدأ الختمة
            </button>
          </div>

          {/* Custom Time Plan */}
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500/20">
            <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100">حسب وقتك</h3>
            <p className="text-gray-500 dark:text-gray-400 font-tajawal text-sm mb-2">
              حدد دقائق القراءة اليومية وسنقوم بجدولة الختمة لك
            </p>
            <div className="flex items-center gap-3 w-full bg-gray-50 dark:bg-white/5 p-2 rounded-xl">
              <input 
                type="number" 
                min="5" 
                max="120" 
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-16 bg-white dark:bg-black/20 text-center rounded-lg py-1 outline-none border border-gray-200 dark:border-white/10"
              />
              <span className="text-sm font-tajawal text-gray-600 dark:text-gray-300">دقيقة يومياً</span>
            </div>
            <button 
              onClick={handleCustomStart}
              className="mt-2 w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-400 transition-colors"
            >
              احسب وابدأ
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Progress Overview */}
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full -z-10" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100 mb-1">
                  تقدم الختمة
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-tajawal text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  الهدف: {khatma.targetDays} يوم
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold font-mono text-primary dark:text-gold">
                  {khatma.completedPages} <span className="text-lg text-gray-400">/ 604</span>
                </div>
                <p className="text-sm text-gray-500 font-tajawal mb-2">صفحة مقروءة</p>
                {khatma.completedPages >= 604 && (
                  <button 
                    onClick={() => setShareAchievement({ title: 'ختم القرآن الكريم', description: 'أتممت بفضل الله قراءة القرآن الكريم كاملاً' })}
                    className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors mr-auto"
                  >
                    <Share2 className="w-3 h-3" />
                    مشاركة الختمة
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>البداية</span>
                <span>{Math.round(progressPercentage)}%</span>
                <span>النهاية</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-l from-primary to-primary-light dark:from-gold dark:to-yellow-300 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Today's Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 md:p-8 rounded-3xl border-2 border-primary/20 dark:border-gold/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center text-primary dark:text-gold">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-amiri text-gray-800 dark:text-gray-100">ورد اليوم</h3>
              </div>
              
              {isCompletedToday ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold font-tajawal text-gray-800 dark:text-gray-100">
                    أنجزت ورد اليوم، بارك الله فيك!
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    يمكنك الاستمرار في القراءة إذا أردت، وسيقوم النظام بإعادة الجدولة تلقائياً غداً لتقليل الورد القادم.
                  </p>
                  <button 
                    onClick={() => navigate('/quran')}
                    className="mt-4 px-6 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    متابعة القراءة الإضافية
                  </button>
                </div>
              ) : todaySchedule ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal mb-1">المطلوب قراءته</p>
                      <p className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">
                        من صفحة {todaySchedule.startPage} إلى {todaySchedule.endPage}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono text-primary dark:text-gold">
                        {todaySchedule.pagesCount}
                      </div>
                      <p className="text-xs text-gray-500 font-tajawal">صفحة</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => {
                        // Save to localStorage to jump directly to the start page
                        localStorage.setItem('quranCurrentPage', todaySchedule.startPage.toString());
                        navigate('/quran');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
                    >
                      <Play className="w-5 h-5" />
                      ابدأ القراءة الآن
                    </button>
                    <button 
                      onClick={markTodayCompleted}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      أنجزت اليوم
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لقد أتممت الختمة! مبارك لك.
                </div>
              )}
            </div>

            {/* Smart Engine Info */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-primary dark:text-gold mb-2">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-bold font-tajawal">المحرك الذكي</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-tajawal leading-relaxed">
                يقوم النظام بإعادة حساب الصفحات المطلوبة يومياً بناءً على ما قرأته فعلياً. 
              </p>
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs font-tajawal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>إذا تأخرت يوماً، سيتم توزيع الصفحات المتبقية على الأيام القادمة تلقائياً.</span>
              </div>
              
              <button 
                onClick={cancelKhatma}
                className="w-full mt-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors font-tajawal"
              >
                إلغاء الختمة الحالية
              </button>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-xl font-bold font-amiri text-gray-800 dark:text-gray-100 mb-6">الجدول القادم (أسبوع)</h3>
            <div className="space-y-3">
              {schedule.slice(1).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 text-sm font-bold font-mono">
                      +{day.dayOffset}
                    </div>
                    <div>
                      <p className="font-bold font-tajawal text-gray-800 dark:text-gray-200">
                        {day.date.toLocaleDateString('ar-EG', { weekday: 'long' })}
                      </p>
                      <p className="text-xs text-gray-500 font-tajawal">
                        من {day.startPage} إلى {day.endPage}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold font-mono text-primary dark:text-gold">{day.pagesCount}</span>
                    <span className="text-xs text-gray-500 ml-1 font-tajawal">صفحة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AchievementShareModal 
        isOpen={!!shareAchievement}
        onClose={() => setShareAchievement(null)}
        title={shareAchievement?.title || ''}
        description={shareAchievement?.description || ''}
      />
    </motion.div>
  );
}
