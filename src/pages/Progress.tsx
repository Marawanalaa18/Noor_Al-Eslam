import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, BookOpen, Clock, Award, Flame, Heart, CheckCircle2, Share2, X, Info } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/utils/cn';
import { AchievementShareModal } from '@/components/AchievementShareModal';
import { BADGE_CATEGORIES, BadgeCategory, BadgeLevel } from '@/data/badges';

export function Progress() {
  const { progress, getTodayDateString, recordShare } = useProgress();
  const [shareAchievement, setShareAchievement] = useState<{ title: string, description: string } | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{ category: BadgeCategory, level: BadgeLevel } | null>(null);

  const todayStr = getTodayDateString();
  const isReadToday = progress.lastActiveDate === todayStr;

  // Calculate pages this week
  const pagesThisWeek = useMemo(() => {
    let total = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const offset = d.getTimezoneOffset() * 60000;
      const dateStr = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
      total += progress.dailyPages?.[dateStr] || 0;
    }
    return total;
  }, [progress.dailyPages]);

  // Calculate average reading time
  const avgReadingTime = useMemo(() => {
    if (!progress.readingMinutes) return 0;
    const days = Object.keys(progress.readingMinutes);
    if (days.length === 0) return 0;
    const totalMinutes = days.reduce((sum, day) => sum + progress.readingMinutes[day], 0);
    return Math.round(totalMinutes / days.length);
  }, [progress.readingMinutes]);

  const handleShare = (title: string, description: string) => {
    setShareAchievement({ title, description });
    recordShare();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
      dir="rtl"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">لوحة التقدم</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">
          وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ
        </p>
      </div>

      {/* Streak Section */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-tajawal text-gray-800 dark:text-gray-100">
                {progress.streak || 0} أيام متتالية
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-500 dark:text-gray-400 font-tajawal text-sm">
                  {isReadToday 
                    ? 'أحسنت! لقد قرأت اليوم، استمر في هذا الإنجاز الرائع 🌟' 
                    : 'لم تقرأ اليوم بعد، خصص بضع دقائق لتغذية روحك 🕊️'}
                </p>
                {(progress.streak || 0) >= 7 && (
                  <button 
                    onClick={() => handleShare('إنجاز الالتزام', `حافظت على قراءة القرآن لمدة ${progress.streak} أيام متتالية`)}
                    className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full hover:bg-orange-500/20 transition-colors font-bold"
                  >
                    <Share2 className="w-3 h-3" />
                    مشاركة
                  </button>
                )}
              </div>
            </div>
          </div>
          {!isReadToday && (
            <div className="bg-primary/5 dark:bg-gold/5 border border-primary/10 dark:border-gold/10 p-4 rounded-xl flex items-start gap-3 max-w-sm">
              <Heart className="w-5 h-5 text-primary dark:text-gold flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300 font-tajawal leading-relaxed">
                لا بأس إن فاتك يوم، المهم أن تعود. قليل دائم خير من كثير منقطع.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="صفحات هذا الأسبوع" 
          value={pagesThisWeek} 
          icon={<BookOpen className="w-5 h-5" />} 
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard 
          title="الأجزاء المكتملة" 
          value={progress.completedJuzs?.length || 0} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard 
          title="الأذكار المنجزة" 
          value={progress.totalAdhkar || 0} 
          icon={<Activity className="w-5 h-5" />} 
          color="text-gold"
          bg="bg-gold/10"
        />
        <StatCard 
          title="متوسط وقت القراءة" 
          value={`${avgReadingTime} د`} 
          icon={<Clock className="w-5 h-5" />} 
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Badges Section */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-amiri text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-gold" />
            أوسمة الإنجاز
          </h2>
        </div>
        
        <div className="space-y-10">
          {BADGE_CATEGORIES.map((category, idx) => {
            const currentVal = category.getProgress(progress);
            const Icon = category.icon;

            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold font-tajawal text-lg text-gray-800 dark:text-gray-100">
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 font-tajawal bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                    {currentVal} / {category.levels[category.levels.length - 1].target}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {category.levels.map((level, levelIdx) => {
                    const isAchieved = currentVal >= level.target;
                    
                    return (
                      <motion.button
                        key={level.tier}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (idx * 0.1) + (levelIdx * 0.05) }}
                        onClick={() => setSelectedBadge({ category, level })}
                        className={cn(
                          "glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group",
                          isAchieved ? `border border-primary/20 dark:border-gold/20 shadow-md ${level.glowColor}` : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0 border border-transparent"
                        )}
                      >
                        {/* Background Tier Indicator */}
                        {isAchieved && (
                          <div className="absolute top-0 right-0 w-12 h-12 opacity-10 -z-10">
                            <Icon className={cn("w-full h-full", level.color)} />
                          </div>
                        )}

                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", 
                          isAchieved ? `bg-opacity-10 ${level.color.replace('text-', 'bg-')}` : "bg-gray-200 dark:bg-gray-800",
                          level.color
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="space-y-1 w-full">
                          <h4 className="font-bold font-tajawal text-sm text-gray-800 dark:text-gray-100 line-clamp-1">
                            {level.title}
                          </h4>
                          {isAchieved ? (
                            <div className="flex justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-500 font-tajawal">
                              الهدف: {level.target}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal 
            category={selectedBadge.category} 
            level={selectedBadge.level}
            progress={progress} 
            onClose={() => setSelectedBadge(null)} 
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      <AchievementShareModal 
        isOpen={!!shareAchievement}
        onClose={() => setShareAchievement(null)}
        title={shareAchievement?.title || ''}
        description={shareAchievement?.description || ''}
      />
    </motion.div>
  );
}

function StatCard({ title, value, icon, color, bg }: { title: string, value: string | number, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", bg, color)}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-tajawal mb-1">{title}</p>
        <p className="text-2xl font-bold font-mono text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function BadgeModal({ category, level, progress, onClose, onShare }: { category: BadgeCategory, level: BadgeLevel, progress: any, onClose: () => void, onShare: (t: string, d: string) => void }) {
  const currentVal = category.getProgress(progress);
  const isAchieved = currentVal >= level.target;
  const Icon = category.icon;

  const progressPercent = isAchieved 
    ? 100 
    : Math.min(100, Math.max(0, (currentVal / level.target) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative">
          {/* Background Glow */}
          <div className={cn("absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none", level.color.replace('text-', 'bg-'))} />

          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6 relative", 
            isAchieved ? `bg-opacity-10 ${level.color.replace('text-', 'bg-')}` : "bg-gray-100 dark:bg-gray-800",
            level.color
          )}>
            <Icon className="w-12 h-12" />
            {isAchieved && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>

          <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{category.name} - مستوى {level.tier}</span>
          <h2 className={cn("text-3xl font-bold font-amiri mb-3", level.color)}>
            {level.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-tajawal mb-8">
            {level.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full space-y-3 mb-8">
            <div className="flex justify-between text-sm font-tajawal font-bold">
              <span className="text-gray-700 dark:text-gray-200">التقدم الحالي</span>
              <span className={level.color}>{currentVal} / {level.target}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full", level.color.replace('text-', 'bg-'))}
              />
            </div>
          </div>

          {/* Rarity Info */}
          <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 flex items-start gap-3 text-right mb-6">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-800 dark:text-blue-300 font-tajawal text-sm mb-1">معلومة نادرة</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-tajawal leading-relaxed">
                <span className="font-bold">{level.rarity}%</span> من المستخدمين لم يحصلوا على هذا الوسام بعد. {isAchieved ? 'أنت من النخبة!' : 'استمر لتكون من المتميزين!'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
            {isAchieved && (
              <button 
                onClick={() => {
                  onClose();
                  onShare(level.title, level.description);
                }}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold font-tajawal flex items-center justify-center gap-2 transition-colors",
                  "bg-primary text-white hover:bg-primary/90 dark:bg-gold dark:text-black dark:hover:bg-gold/90"
                )}
              >
                <Share2 className="w-5 h-5" />
                مشاركة الإنجاز
              </button>
            )}
            {!isAchieved && (
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-xl font-bold font-tajawal transition-colors"
              >
                حسناً، سأستمر
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
