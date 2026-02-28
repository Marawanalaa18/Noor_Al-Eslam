import { BookOpen, Heart, Flame, Clock, Moon, Shield, Sun, Zap, Share2 } from 'lucide-react';
import { UserProgress } from '@/hooks/useProgress';

export type BadgeTier = 1 | 2 | 3 | 4 | 5;

export interface BadgeLevel {
  tier: BadgeTier;
  target: number;
  title: string;
  description: string;
  rarity: number;
  color: string;
  glowColor: string;
}

export interface BadgeCategory {
  id: string;
  name: string;
  icon: any;
  levels: BadgeLevel[];
  getProgress: (stats: UserProgress) => number;
}

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'dhikr',
    name: 'الذاكرين',
    icon: Heart,
    getProgress: (stats) => stats.totalAdhkar || 0,
    levels: [
      { tier: 1, target: 10, title: 'بداية الذكر', description: 'أكملت 10 أذكار', rarity: 15, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 100, title: 'الذاكر المستمر', description: 'أكملت 100 ذكر', rarity: 45, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 1000, title: 'القلب المطمئن', description: 'أكملت 1000 ذكر', rarity: 75, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 5000, title: 'الذاكرين الله كثيراً', description: 'أكملت 5000 ذكر', rarity: 92, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 10000, title: 'نخبة الذاكرين', description: 'أكملت 10000 ذكر', rarity: 98, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'quran',
    name: 'أهل القرآن',
    icon: BookOpen,
    getProgress: (stats) => {
      if (!stats.dailyPages) return 0;
      return Object.values(stats.dailyPages).reduce((sum, val) => sum + val, 0);
    },
    levels: [
      { tier: 1, target: 1, title: 'أول الغيث', description: 'قرأت أول صفحة', rarity: 10, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 20, title: 'قارئ الجزء', description: 'قرأت جزءاً كاملاً', rarity: 35, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 604, title: 'ختمة النور', description: 'أتممت ختمة كاملة', rarity: 80, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 1208, title: 'الختمتين', description: 'أتممت ختمتين', rarity: 94, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 3020, title: 'صاحب القرآن', description: 'أتممت 5 ختمات', rarity: 99, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'streak',
    name: 'الاستمرارية',
    icon: Flame,
    getProgress: (stats) => stats.bestStreak,
    levels: [
      { tier: 1, target: 2, title: 'خطوة بخطوة', description: 'يومين متتاليين', rarity: 20, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 7, title: 'أسبوع الالتزام', description: '7 أيام متتالية', rarity: 50, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 30, title: 'شهر التغيير', description: '30 يوم متتالي', rarity: 85, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 90, title: 'درع الثبات', description: '90 يوم متتالي', rarity: 96, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 365, title: 'الأسطورة', description: 'سنة كاملة بدون انقطاع', rarity: 99.9, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'time',
    name: 'الوقت المبارك',
    icon: Clock,
    getProgress: (stats) => {
      if (!stats.readingMinutes) return 0;
      return Object.values(stats.readingMinutes).reduce((sum, val) => sum + val, 0);
    },
    levels: [
      { tier: 1, target: 15, title: 'بداية الوقت', description: '15 دقيقة في التطبيق', rarity: 15, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 100, title: 'المستثمر', description: '100 دقيقة', rarity: 40, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 500, title: 'ساعات النور', description: '500 دقيقة', rarity: 70, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 2000, title: 'المعتكف', description: '2000 دقيقة', rarity: 90, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 10000, title: 'عاشق الخلوة', description: '10000 دقيقة', rarity: 98, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'night',
    name: 'ساكن الليل',
    icon: Moon,
    getProgress: (stats) => stats.nightDhikrCount,
    levels: [
      { tier: 1, target: 1, title: 'أول السحر', description: 'ذكر واحد بعد منتصف الليل', rarity: 30, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 5, title: 'مناجاة', description: '5 أذكار في الليل', rarity: 60, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 20, title: 'قائم الليل', description: '20 ذكر في الليل', rarity: 85, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 50, title: 'أنيس الظلام', description: '50 ذكر في الليل', rarity: 95, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 100, title: 'نجم الأسحار', description: '100 ذكر في الليل', rarity: 99, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'loyalty',
    name: 'الولاء',
    icon: Shield,
    getProgress: (stats) => stats.appOpens,
    levels: [
      { tier: 1, target: 10, title: 'زائر دائم', description: 'فتحت التطبيق 10 مرات', rarity: 25, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 50, title: 'صديق التطبيق', description: 'فتحت التطبيق 50 مرة', rarity: 55, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 100, title: 'مخلص', description: 'فتحت التطبيق 100 مرة', rarity: 75, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 500, title: 'جزء من حياتي', description: 'فتحت التطبيق 500 مرة', rarity: 92, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 1000, title: 'الرفيق الدائم', description: 'فتحت التطبيق 1000 مرة', rarity: 98, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'fajr',
    name: 'أهل الفجر',
    icon: Sun,
    getProgress: (stats) => stats.fajrWakeups,
    levels: [
      { tier: 1, target: 1, title: 'نداء الفجر', description: 'استخدمت التطبيق وقت الفجر', rarity: 50, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 7, title: 'أسبوع الفجر', description: '7 أيام وقت الفجر', rarity: 75, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 30, title: 'شهر الفجر', description: '30 يوم وقت الفجر', rarity: 90, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 90, title: 'مرابط الفجر', description: '90 يوم وقت الفجر', rarity: 97, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 365, title: 'أسطورة الفجر', description: 'سنة كاملة وقت الفجر', rarity: 99.9, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'return',
    name: 'العودة القوية',
    icon: Zap,
    getProgress: (stats) => stats.strongReturns,
    levels: [
      { tier: 1, target: 1, title: 'أواب', description: 'عدت بعد انقطاع 3 أيام', rarity: 60, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 3, title: 'مستغفر', description: 'عدت بعد انقطاع 3 مرات', rarity: 80, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 5, title: 'تواب', description: 'عدت بعد انقطاع 5 مرات', rarity: 90, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 10, title: 'لا ييأس', description: 'عدت بعد انقطاع 10 مرات', rarity: 96, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 20, title: 'المنتصر على النفس', description: 'عدت بعد انقطاع 20 مرة', rarity: 99, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  },
  {
    id: 'share',
    name: 'سفير الذكر',
    icon: Share2,
    getProgress: (stats) => stats.sharesCount,
    levels: [
      { tier: 1, target: 1, title: 'مبادر', description: 'شاركت إنجازاً واحداً', rarity: 40, color: 'text-emerald-500', glowColor: 'shadow-emerald-500/20' },
      { tier: 2, target: 5, title: 'داعية', description: 'شاركت 5 إنجازات', rarity: 70, color: 'text-blue-500', glowColor: 'shadow-blue-500/30' },
      { tier: 3, target: 20, title: 'ناشر الخير', description: 'شاركت 20 إنجازاً', rarity: 88, color: 'text-purple-500', glowColor: 'shadow-purple-500/40' },
      { tier: 4, target: 50, title: 'مؤثر إسلامي', description: 'شاركت 50 إنجازاً', rarity: 96, color: 'text-orange-500', glowColor: 'shadow-orange-500/50' },
      { tier: 5, target: 100, title: 'سفير الذكر', description: 'شاركت 100 إنجاز', rarity: 99, color: 'text-yellow-400', glowColor: 'shadow-yellow-400/60' },
    ]
  }
];
