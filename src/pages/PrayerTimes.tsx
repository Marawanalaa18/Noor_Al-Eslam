import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, AlertCircle, Calendar, Settings } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aladhanApi } from '@/utils/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/utils/cn';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export function PrayerTimes() {
  const { latitude, longitude, error, loading: geoLoading } = useGeolocation();
  const [timings, setTimings] = useState<any>(null);
  const [dateInfo, setDateInfo] = useState<any>(null);
  const [locationName, setLocationName] = useState('جاري تحديد الموقع...');
  const [lastLocation, setLastLocation] = useLocalStorage<{ lat: number, lng: number } | null>('lastLocation', null);
  const [method, setMethod] = useLocalStorage<number>('prayerMethod', 5); // Default: Egyptian General Authority of Survey
  const [hijriAdjustment, setHijriAdjustment] = useLocalStorage<number>('hijriAdjustment', 0);
  const [isFetching, setIsFetching] = useState(false);

  const calculationMethods = [
    { id: 5, name: 'الهيئة العامة المصرية للمساحة' },
    { id: 4, name: 'جامعة أم القرى بمكة المكرمة' },
    { id: 3, name: 'رابطة العالم الإسلامي' },
    { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي' },
    { id: 8, name: 'منطقة الخليج' },
    { id: 9, name: 'الكويت' },
    { id: 10, name: 'قطر' },
  ];

  useEffect(() => {
    const fetchTimings = async (lat: number, lng: number, calcMethod: number, adj: number) => {
      setIsFetching(true);
      try {
        const res = await aladhanApi.get('/timings', {
          params: { latitude: lat, longitude: lng, method: calcMethod, adjustment: adj }
        });
        setTimings(res.data.data.timings);
        setDateInfo(res.data.data.date);
        setLocationName(`خط العرض: ${lat.toFixed(2)} - خط الطول: ${lng.toFixed(2)}`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    if (latitude && longitude) {
      setLastLocation({ lat: latitude, lng: longitude });
      fetchTimings(latitude, longitude, method, hijriAdjustment);
    } else if (lastLocation) {
      fetchTimings(lastLocation.lat, lastLocation.lng, method, hijriAdjustment);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, method, hijriAdjustment]);

  const prayerNames = [
    { key: 'Fajr', ar: 'الفجر' },
    { key: 'Sunrise', ar: 'الشروق' },
    { key: 'Dhuhr', ar: 'الظهر' },
    { key: 'Asr', ar: 'العصر' },
    { key: 'Maghrib', ar: 'المغرب' },
    { key: 'Isha', ar: 'العشاء' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">مواقيت الصلاة</h1>
        
        {dateInfo && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 dark:text-gray-300 font-tajawal">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full">
              <Calendar className="w-5 h-5 text-primary dark:text-gold" />
              <span>{dateInfo.hijri.weekday.ar}، {dateInfo.hijri.day} {dateInfo.hijri.month.ar} {dateInfo.hijri.year} هـ</span>
            </div>
            <div className="hidden sm:block text-gray-300 dark:text-gray-600">•</div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full">
              <span>{dateInfo.gregorian.day} {dateInfo.gregorian.month.en} {dateInfo.gregorian.year} م</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <MapPin className="w-5 h-5" />
          <span dir="ltr">{locationName}</span>
        </div>
      </div>

      {/* Settings Section */}
      <div className="glass-card p-6 rounded-3xl max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-primary dark:text-gold" />
          <h3 className="text-lg font-bold font-tajawal">إعدادات الحساب</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">طريقة الحساب</label>
            <select 
              value={method}
              onChange={(e) => setMethod(Number(e.target.value))}
              className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-tajawal focus:ring-2 focus:ring-primary dark:focus:ring-gold outline-none transition-shadow cursor-pointer"
            >
              {calculationMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">تعديل التاريخ الهجري (بالأيام)</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setHijriAdjustment(prev => prev - 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-lg"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-lg font-bold">
                {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}
              </div>
              <button 
                onClick={() => setHijriAdjustment(prev => prev + 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              استخدم هذا الخيار إذا كان التاريخ الهجري يختلف عن رؤية الهلال في بلدك
            </p>
          </div>
        </div>
      </div>

      {error && !lastLocation && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p>يرجى تفعيل خدمة تحديد الموقع لعرض مواقيت الصلاة بدقة.</p>
        </div>
      )}

      {(geoLoading || isFetching) && !timings && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-gold"></div>
        </div>
      )}

      {timings && (
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300",
          isFetching ? "opacity-50" : "opacity-100"
        )}>
          {prayerNames.map((prayer, idx) => (
            <motion.div
              key={prayer.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-primary dark:text-gold">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-tajawal">{prayer.ar}</h3>
              <p className="text-3xl font-mono text-gray-800 dark:text-gray-200">
                {timings[prayer.key]}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
