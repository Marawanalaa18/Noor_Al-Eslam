import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Headphones, ListMusic, Download } from 'lucide-react';
import { alquranApi } from '@/utils/api';
import { cn } from '@/utils/cn';
import { useAudio } from '@/contexts/AudioContext';

export function Audio() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const { 
    isPlaying, 
    progress, 
    duration, 
    currentSurah, 
    currentReciter, 
    playSurah, 
    togglePlayPause, 
    seek,
    playbackRate,
    setPlaybackRate
  } = useAudio();

  const reciters = [
    { id: 'https://server7.mp3quran.net/basit', name: 'عبد الباسط عبد الصمد (مرتل)' },
    { id: 'https://server11.mp3quran.net/sds', name: 'عبد الرحمن السديس' },
    { id: 'https://server11.mp3quran.net/shatri', name: 'أبو بكر الشاطري' },
    { id: 'https://server7.mp3quran.net/s_gmd', name: 'سعد الغامدي' },
    { id: 'https://server8.mp3quran.net/hani', name: 'هاني الرفاعي' },
    { id: 'https://server9.mp3quran.net/hthfi', name: 'علي بن عبد الرحمن الحذيفي' },
    { id: 'https://server6.mp3quran.net/akdr', name: 'إبراهيم الأخضر' },
    { id: 'https://server10.mp3quran.net/minsh', name: 'محمد صديق المنشاوي' },
    { id: 'https://server8.mp3quran.net/ayyub', name: 'محمد أيوب' },
    { id: 'https://server8.mp3quran.net/jbrl', name: 'محمد جبريل' },
    { id: 'https://server7.mp3quran.net/shur', name: 'سعود الشريم' },
    { id: 'https://server8.mp3quran.net/afs', name: 'مشاري العفاسي' },
    { id: 'https://server13.mp3quran.net/husr', name: 'محمود خليل الحصري' },
    { id: 'https://server12.mp3quran.net/maher', name: 'ماهر المعيقلي' },
  ];

  const [selectedReciterId, setSelectedReciterId] = useState(currentReciter?.id || reciters[0].id);

  useEffect(() => {
    alquranApi.get('/surah').then(res => {
      setSurahs(res.data.data);
    }).catch(console.error);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (surahNumber: number, surahName: string) => {
    const audioUrl = `${selectedReciterId}/${surahNumber.toString().padStart(3, '0')}.mp3`;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `سورة_${surahName}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback if fetch fails due to CORS
      window.open(audioUrl, '_blank');
    }
  };

  const activeSurah = currentSurah || (surahs.length > 0 ? surahs[0] : null);
  const activeReciter = reciters.find(r => r.id === selectedReciterId) || reciters[0];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Player Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 space-y-6"
      >
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 dark:from-primary-dark/40 dark:to-gold-dark/20 z-0"></div>
          
          <div className="relative z-10 w-48 h-48 rounded-full glass flex items-center justify-center mb-8 shadow-2xl border-4 border-white/20 dark:border-white/10">
            <Headphones className="w-20 h-20 text-primary dark:text-gold" />
          </div>

          <h2 className="relative z-10 text-4xl font-bold font-amiri text-gradient mb-2">
            {activeSurah?.name || 'جاري التحميل...'}
          </h2>
          <p className="relative z-10 text-gray-500 dark:text-gray-400 font-tajawal mb-8">
            {activeReciter.name}
          </p>

          {/* Controls */}
          <div className="relative z-10 w-full max-w-md space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-500">{formatTime(progress)}</span>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={progress} 
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-gold"
              />
              <span className="text-xs font-mono text-gray-500">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => {
                  if (activeSurah && activeSurah.number > 1) {
                    const prevSurah = surahs.find(s => s.number === activeSurah.number - 1);
                    if (prevSurah) playSurah(prevSurah, activeReciter);
                  }
                }}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => {
                  if (currentSurah?.number === activeSurah?.number && currentReciter?.id === activeReciter.id) {
                    togglePlayPause();
                  } else if (activeSurah) {
                    playSurah(activeSurah, activeReciter);
                  }
                }}
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                {isPlaying && currentSurah?.number === activeSurah?.number ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button 
                onClick={() => {
                  if (activeSurah && activeSurah.number < 114) {
                    const nextSurah = surahs.find(s => s.number === activeSurah.number + 1);
                    if (nextSurah) playSurah(nextSurah, activeReciter);
                  }
                }}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
              >
                <SkipBack className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => activeSurah && handleDownload(activeSurah.number, activeSurah.name)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-primary dark:text-gold"
              >
                <Download className="w-4 h-4" />
                تنزيل السورة
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Playlist Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <ListMusic className="w-6 h-6 text-primary dark:text-gold" />
            <h3 className="text-xl font-bold font-tajawal">إعدادات التلاوة</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">اختر القارئ</label>
              <select 
                value={selectedReciterId}
                onChange={(e) => {
                  setSelectedReciterId(e.target.value);
                  // If currently playing, we might want to switch the audio to the new reciter
                  if (isPlaying && currentSurah) {
                    const newReciter = reciters.find(r => r.id === e.target.value);
                    if (newReciter) playSurah(currentSurah, newReciter);
                  }
                }}
                className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-tajawal focus:ring-2 focus:ring-primary dark:focus:ring-gold outline-none transition-shadow cursor-pointer hover:border-primary/50 dark:hover:border-gold/50"
              >
                {reciters.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                تغيير القارئ سيقوم بتحديث التلاوة الحالية تلقائياً
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">سرعة التلاوة</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-gold"
                />
                <span className="text-sm font-mono font-bold text-primary dark:text-gold w-12 text-center">
                  {playbackRate}x
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex flex-col h-[500px]">
          <h3 className="text-xl font-bold font-tajawal mb-4 sticky top-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm p-2 rounded-xl z-10">
            قائمة السور
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {surahs.map(surah => (
              <div key={surah.number} className="flex items-center gap-2">
                <button
                  onClick={() => playSurah(surah, activeReciter)}
                  className={cn(
                    "flex-1 text-right p-3 rounded-xl flex items-center justify-between transition-colors group",
                    currentSurah?.number === surah.number 
                      ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold font-bold" 
                      : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full glass flex items-center justify-center text-xs font-mono">
                      {surah.number}
                    </span>
                    <span className="font-amiri text-lg">{surah.name}</span>
                  </div>
                  {currentSurah?.number === surah.number && isPlaying && (
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-primary dark:bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-4 bg-primary dark:bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-2 bg-primary dark:bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(surah.number, surah.name)}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary dark:hover:text-gold transition-colors"
                  title="تنزيل السورة"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
