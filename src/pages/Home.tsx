import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Clock, Heart, Moon, Sun, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aladhanApi, alquranApi } from '@/utils/api';
import { isAfter } from 'date-fns';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function Home() {
  const { latitude, longitude, error, loading } = useGeolocation();
  const [timings, setTimings] = useState<any>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [ayahOfTheDay, setAyahOfTheDay] = useState<any>(null);
  const [method] = useLocalStorage<number>('prayerMethod', 5);

  useEffect(() => {
    // Fetch Ayah of the day
    const today = new Date().toDateString();
    const storedAyah = localStorage.getItem('ayahOfTheDay');
    const storedDate = localStorage.getItem('ayahDate');

    if (storedAyah && storedDate === today) {
      setAyahOfTheDay(JSON.parse(storedAyah));
    } else {
      // 6236 is the total number of ayahs in the Quran
      const randomAyahNumber = Math.floor(Math.random() * 6236) + 1;
      alquranApi.get(`/ayah/${randomAyahNumber}`).then(res => {
        const ayahData = res.data.data;
        setAyahOfTheDay(ayahData);
        localStorage.setItem('ayahOfTheDay', JSON.stringify(ayahData));
        localStorage.setItem('ayahDate', today);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      aladhanApi.get('/timings', {
        params: {
          latitude,
          longitude,
          method: method,
        }
      }).then(res => {
        setTimings(res.data.data.timings);
      }).catch(console.error);
    }
  }, [latitude, longitude, method]);

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();
      const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const arabicNames: Record<string, string> = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
      };

      let next = null;
      for (const prayer of prayerNames) {
        const timeStr = timings[prayer];
        const cleanTimeStr = timeStr.split(' ')[0]; // Remove timezone if present e.g. "15:45 (EET)"
        const [hours, minutes] = cleanTimeStr.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        if (isAfter(prayerTime, now)) {
          const diffMs = prayerTime.getTime() - now.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          next = {
            name: arabicNames[prayer],
            time: cleanTimeStr,
            remaining: `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
          };
          break;
        }
      }

      // If all prayers today have passed, next is Fajr tomorrow
      if (!next) {
        const timeStr = timings['Fajr'];
        const cleanTimeStr = timeStr.split(' ')[0];
        const [hours, minutes] = cleanTimeStr.split(':');
        const prayerTime = new Date();
        prayerTime.setDate(prayerTime.getDate() + 1);
        prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        const diffMs = prayerTime.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

        next = {
          name: arabicNames['Fajr'],
          time: cleanTimeStr,
          remaining: `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
        };
      }

      setNextPrayer(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] overflow-hidden glass-card p-8 md:p-12 flex flex-col items-center text-center gap-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 dark:from-primary-dark/40 dark:to-gold-dark/20 z-0"></div>
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold font-amiri text-gradient">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-tajawal">
            مرحباً بك في منصة "نور"، رفيقك اليومي للقرآن الكريم، مواقيت الصلاة، والأذكار.
          </p>
        </div>

        {nextPrayer && (
          <div className="relative z-10 glass px-6 py-4 rounded-2xl flex flex-col items-center gap-2 border-gold/30">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">الصلاة القادمة</span>
            <div className="text-3xl font-bold text-primary dark:text-gold font-tajawal">
              {nextPrayer.name}
            </div>
            <div className="text-2xl font-mono text-gray-800 dark:text-gray-200">
              {nextPrayer.remaining}
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-4">
          <Link to="/quran" className="px-8 py-4 rounded-full bg-primary hover:bg-primary-light text-white font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            قراءة القرآن
          </Link>
          <Link to="/audio" className="px-8 py-4 rounded-full glass hover:bg-white/20 dark:hover:bg-white/10 text-primary dark:text-gold font-bold transition-all shadow-lg flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            استمع الآن
          </Link>
        </div>
      </motion.section>

      {/* Ayah of the Day */}
      {ayahOfTheDay && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 dark:bg-gold/5 rounded-bl-full flex items-start justify-end p-6">
            <Star className="w-8 h-8 text-primary/30 dark:text-gold/30" />
          </div>
          
          <div className="text-center space-y-6 relative z-10">
            <h2 className="text-xl font-bold font-tajawal text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              آية اليوم
            </h2>
            
            <p className="text-2xl md:text-4xl leading-relaxed font-amiri text-primary-dark dark:text-gold-light">
              "{ayahOfTheDay.text}"
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-gray-600 dark:text-gray-300">
              <span>سورة {ayahOfTheDay.surah.name}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>آية {ayahOfTheDay.numberInSurah}</span>
            </div>
          </div>
        </motion.section>
      )}

      {/* Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { title: 'مواقيت الصلاة', icon: <Clock className="w-8 h-8" />, desc: 'مواقيت دقيقة حسب موقعك الحالي', to: '/prayer-times', color: 'text-blue-500' },
          { title: 'القرآن الكريم', icon: <BookOpen className="w-8 h-8" />, desc: 'قراءة مريحة مع تفاسير وتراجم', to: '/quran', color: 'text-emerald-500' },
          { title: 'الاستماع للقرآن', icon: <Headphones className="w-8 h-8" />, desc: 'أصوات عذبة لأشهر القراء', to: '/audio', color: 'text-purple-500' },
          { title: 'الأذكار', icon: <Heart className="w-8 h-8" />, desc: 'أذكار الصباح والمساء واليوم والليلة', to: '/adhkar', color: 'text-rose-500' },
          { title: 'السنن النبوية', icon: <BookOpen className="w-8 h-8" />, desc: 'سنن النبي ﷺ في الحياة اليومية', to: '/sunnah', color: 'text-amber-500' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={card.to} className="block h-full glass-card p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 glass group-hover:scale-110 transition-transform", card.color)}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 font-tajawal">{card.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
