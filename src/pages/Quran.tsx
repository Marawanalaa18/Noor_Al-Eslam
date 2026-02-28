import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, ChevronLeft, ChevronRight, X, Maximize, Minimize, Bookmark, Play, Pause, FastForward, Settings, Volume2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/utils/cn';
import { useQuranData } from '@/hooks/useQuranData';
import { useProgress } from '@/hooks/useProgress';
import { AyahToolbar, AyahInfo } from '@/components/AyahToolbar';

export const normalizeArabic = (text: string) => {
  return text
    .replace(/[\u0617-\u061A\u064B-\u0652]/g, '') // Remove tashkeel
    .replace(/[أإآ]/g, 'ا') // Normalize Alif
    .replace(/ة/g, 'ه') // Normalize Ta Marbuta
    .replace(/ى/g, 'ي'); // Normalize Ya
};

const RECITERS = [
  { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبد الباسط عبد الصمد (مجود)' },
  { id: 'Abdul_Basit_Murattal_192kbps', name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبد الرحمن السديس' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'أبو بكر الشاطري' },
  { id: 'Alafasy_128kbps', name: 'مشاري راشد العفاسي' },
  { id: 'Ghamadi_40kbps', name: 'سعد الغامدي' },
  { id: 'Hani_Rifai_192kbps', name: 'هاني الرفاعي' },
  { id: 'Husary_128kbps', name: 'محمود خليل الحصري' },
  { id: 'Hudhaify_128kbps', name: 'علي بن عبد الرحمن الحذيفي' },
  { id: 'Ibrahim_Akhdar_32kbps', name: 'إبراهيم الأخضر' },
  { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي' },
  { id: 'Menshawi_16kbps', name: 'محمد صديق المنشاوي' },
  { id: 'Minshawy_Mujawwad_192kbps', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'Muhammad_Ayyoub_128kbps', name: 'محمد أيوب' },
  { id: 'Muhammad_Jibreel_128kbps', name: 'محمد جبريل' },
  { id: 'Saud_Al-Shuraim_128kbps', name: 'سعود الشريم' },
];

export function Quran() {
  const { data: quranData, loading, error } = useQuranData();
  
  const [currentPageNum, setCurrentPageNum] = useLocalStorage<number>('quranCurrentPage', 1);
  const [fontSize, setFontSize] = useLocalStorage('quranFontSize', 28);
  const [lastRead, setLastRead] = useLocalStorage<{ surah: number, ayah: number, page: number } | null>('lastRead', null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [targetAyah, setTargetAyah] = useState<string>('');
  
  const [highlightedAyah, setHighlightedAyah] = useState<string | null>(null);
  const [showAyahNumbers, setShowAyahNumbers] = useLocalStorage('quranShowAyahNumbers', true);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<{ surah: number, ayah: number } | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const [selectedReciter, setSelectedReciter] = useLocalStorage('quranReciter', RECITERS[0].id);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const { addPages, addReadingTime, markJuzCompleted } = useProgress();

  // Confirmation Dialog State
  const [confirmSaveAyah, setConfirmSaveAyah] = useState<{ surah: number, ayah: number, page: number } | null>(null);

  // Ayah Toolbar State
  const [selectedAyahInfo, setSelectedAyahInfo] = useState<AyahInfo | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number, left: number } | null>(null);
  const scrollPosRef = useRef(0);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchOpen || confirmSaveAyah || selectedAyahInfo) return;
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageNum, isSearchOpen, confirmSaveAyah, selectedAyahInfo]);

  // Toolbar scroll/click outside
  useEffect(() => {
    const handleScroll = () => {
      if (selectedAyahInfo) {
        if (Math.abs(window.scrollY - scrollPosRef.current) > 50) {
          setSelectedAyahInfo(null);
        }
      }
    };
    
    const handleClickOutside = () => {
      if (selectedAyahInfo) {
        setSelectedAyahInfo(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [selectedAyahInfo]);

  // Progress Tracking
  useEffect(() => {
    const timer = setTimeout(() => {
      addPages(1);
      if (quranData && quranData.pages[currentPageNum]) {
        const juz = quranData.pages[currentPageNum][0]?.juz;
        if (juz) markJuzCompleted(juz);
      }
    }, 10000); // 10 seconds on a page counts as read
    return () => clearTimeout(timer);
  }, [currentPageNum, quranData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        addReadingTime(1);
      }
    }, 60000); // Add 1 minute every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Audio Player Logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (isPlaying && currentPlayingAyah) {
      playAyah(currentPlayingAyah.surah, currentPlayingAyah.ayah);
    }
  }, [selectedReciter]);

  const playAyah = (surah: number, ayah: number) => {
    const paddedSurah = surah.toString().padStart(3, '0');
    const paddedAyah = ayah.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/${selectedReciter}/${paddedSurah}${paddedAyah}.mp3`;
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      setIsPlaying(true);
      setCurrentPlayingAyah({ surah, ayah });
      
      // Auto-scroll to playing ayah
      const id = `ayah-${surah}-${ayah}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!currentPlayingAyah && quranData) {
        // Start from first ayah of current page if nothing was playing
        const firstAyahOnPage = quranData.pages[currentPageNum]?.[0];
        if (firstAyahOnPage) {
          playAyah(firstAyahOnPage.surah.number, firstAyahOnPage.numberInSurah);
        }
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
      setAudioProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAudioEnded = () => {
    if (!isContinuousPlay || !currentPlayingAyah || !quranData) {
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
      return;
    }

    // Find next ayah
    const currentAyahIndex = quranData.ayahs.findIndex(
      a => a.surah.number === currentPlayingAyah.surah && a.numberInSurah === currentPlayingAyah.ayah
    );

    if (currentAyahIndex !== -1 && currentAyahIndex < quranData.ayahs.length - 1) {
      const nextAyah = quranData.ayahs[currentAyahIndex + 1];
      
      // Check if we need to turn the page
      if (nextAyah.page !== currentPageNum) {
        setCurrentPageNum(nextAyah.page);
      }
      
      playAyah(nextAyah.surah.number, nextAyah.numberInSurah);
    } else {
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const goToNextPage = () => {
    if (currentPageNum < 604) setCurrentPageNum(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPageNum > 1) setCurrentPageNum(prev => prev - 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !quranData) {
      setSearchResults([]);
      return;
    }
    
    const normalizedQuery = normalizeArabic(query);
    const results = quranData.ayahs.filter(ayah => 
      normalizeArabic(ayah.text).includes(normalizedQuery)
    ).slice(0, 50); // Limit results
    
    setSearchResults(results);
  };

  const jumpToPage = (page: number, surah?: number, ayah?: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPageNum(page);
      setIsSearchOpen(false);
      if (surah && ayah) {
        const id = `ayah-${surah}-${ayah}`;
        setHighlightedAyah(id);
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setTimeout(() => setHighlightedAyah(null), 3000);
        }, 100);
      }
    }
  };

  const handleSurahSelect = (surahNum: number) => {
    if (!quranData) return;
    const page = quranData.surahStartPages[surahNum];
    if (page) {
      jumpToPage(page);
    }
  };

  const handleAyahJump = () => {
    const num = parseInt(targetAyah);
    if (isNaN(num) || !quranData) return;
    const ayah = quranData.ayahs.find(a => a.surah.number === selectedSurah && a.numberInSurah === num);
    if (ayah) {
      jumpToPage(ayah.page, ayah.surah.number, ayah.numberInSurah);
    } else {
      alert('آية غير موجودة في هذه السورة');
    }
  };

  const handleAyahClick = (e: React.MouseEvent<HTMLSpanElement>, surah: number, ayah: number, page: number, text: string, surahName: string) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    setSelectedAyahInfo({
      surah,
      ayah,
      page,
      text,
      surahName
    });
    
    setToolbarPosition({ 
      top: rect.top, 
      left: rect.left + (rect.width / 2) 
    });
    
    scrollPosRef.current = window.scrollY;
  };

  const confirmSave = () => {
    if (confirmSaveAyah) {
      setLastRead(confirmSaveAyah);
      setConfirmSaveAyah(null);
    }
  };

  const cancelSave = () => {
    setConfirmSaveAyah(null);
  };

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNextPage(); // Swipe left -> next page (RTL)
      else goToPrevPage(); // Swipe right -> prev page
    }
    setTouchStart(null);
  };

  if (loading || !quranData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-gold"></div>
        <p className="text-gray-500 font-tajawal">جاري تحميل المصحف الشريف...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 text-red-500">
        <p>حدث خطأ أثناء تحميل المصحف: {error}</p>
      </div>
    );
  }

  const currentPageAyahs = quranData.pages[currentPageNum] || [];
  if (!currentPageAyahs.length) return null;

  const currentSurahName = currentPageAyahs[0]?.surah.name || '';
  const currentJuz = currentPageAyahs[0]?.juz || 1;
  const currentHizb = currentPageAyahs[0]?.hizbQuarter || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative" dir="rtl">
      
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        className="hidden" 
      />

      {/* Top Audio Player & Settings Bar */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 rounded-2xl flex flex-col gap-4 shadow-lg mb-4"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Reciter Selection */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Volume2 className="w-5 h-5 text-primary dark:text-gold" />
                <select 
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-2 text-sm font-tajawal focus:ring-2 focus:ring-primary outline-none flex-1 md:w-64"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-primary/5 dark:bg-gold/5 rounded-full p-1 border border-primary/10 dark:border-gold/10">
                  <button 
                    onClick={togglePlayPause}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-light transition-colors shadow-md"
                    title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  </button>
                  <button 
                    onClick={cyclePlaybackRate}
                    className="px-3 h-10 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors font-mono text-sm font-bold text-primary dark:text-gold"
                    title="سرعة التلاوة"
                  >
                    {playbackRate}x
                  </button>
                  <button
                    onClick={() => setIsContinuousPlay(!isContinuousPlay)}
                    className={cn(
                      "px-3 h-10 flex items-center justify-center rounded-full transition-colors text-sm font-bold",
                      isContinuousPlay 
                        ? "bg-primary/20 text-primary dark:bg-gold/20 dark:text-gold" 
                        : "hover:bg-white dark:hover:bg-white/10 text-gray-500"
                    )}
                    title="تلاوة متواصلة"
                  >
                    متواصل
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Progress Bar */}
            {currentPlayingAyah && (
              <div className="flex items-center gap-3 w-full">
                <span className="text-xs font-mono text-gray-500 w-10 text-center">{formatTime(audioCurrentTime)}</span>
                <div 
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative cursor-pointer"
                  onClick={(e) => {
                    if (!audioRef.current || !audioDuration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, x / rect.width));
                    // RTL adjustment
                    const adjustedPercentage = 1 - percentage;
                    audioRef.current.currentTime = adjustedPercentage * audioDuration;
                  }}
                >
                  <motion.div 
                    className="absolute top-0 right-0 h-full bg-primary dark:bg-gold"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500 w-10 text-center">{formatTime(audioDuration)}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Navigation Bar */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg"
          >
            {/* Surah & Ayah Jump */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select 
                value={selectedSurah}
                onChange={(e) => {
                  setSelectedSurah(Number(e.target.value));
                  handleSurahSelect(Number(e.target.value));
                }}
                className="bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-2 text-sm font-tajawal focus:ring-2 focus:ring-primary outline-none"
              >
                {quranData.surahs.map((s: any) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-xl p-1 border border-gray-200 dark:border-white/10">
                <input 
                  type="number" 
                  placeholder="رقم الآية" 
                  value={targetAyah}
                  onChange={(e) => setTargetAyah(e.target.value)}
                  className="w-20 bg-transparent text-center text-sm outline-none"
                />
                <button 
                  onClick={handleAyahJump}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-light transition-colors"
                >
                  انتقال
                </button>
              </div>
            </div>

            {/* Reading Indicator & Controls */}
            <div className="flex items-center gap-4 text-sm font-tajawal text-gray-600 dark:text-gray-300">
              <div className="hidden lg:flex items-center gap-2">
                <span className="bg-primary/10 dark:bg-gold/10 px-3 py-1 rounded-full">الجزء {currentJuz}</span>
                <span className="bg-primary/10 dark:bg-gold/10 px-3 py-1 rounded-full">الحزب {currentHizb}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAyahNumbers(!showAyahNumbers)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    showAyahNumbers ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold" : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                  )}
                  title={showAyahNumbers ? "إخفاء أرقام الآيات" : "إظهار أرقام الآيات"}
                >
                  <Settings className="w-5 h-5" />
                </button>
                {lastRead && (
                  <button 
                    onClick={() => jumpToPage(lastRead.page, lastRead.surah, lastRead.ayah)}
                    className="flex items-center gap-1 bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                    title="متابعة القراءة"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">متابعة القراءة</span>
                  </button>
                )}
                <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button onClick={() => setIsFocusMode(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="وضع التركيز">
                  <Maximize className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1">
                  <button onClick={() => setFontSize(Math.max(18, fontSize - 2))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10">-</button>
                  <span className="w-6 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize(Math.min(48, fontSize + 2))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Exit */}
      {isFocusMode && (
        <button 
          onClick={() => setIsFocusMode(false)}
          className="fixed top-4 right-4 z-50 p-3 bg-gray-900/50 text-white rounded-full backdrop-blur-md hover:bg-gray-900/80 transition-colors"
        >
          <Minimize className="w-6 h-6" />
        </button>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmSaveAyah && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={cancelSave}
          >
            <motion.div 
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary dark:text-gold">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-amiri mb-2 text-gray-900 dark:text-white">حفظ موضع القراءة</h3>
              <p className="text-gray-600 dark:text-gray-300 font-tajawal mb-6">
                هل تريد حفظ هذه الآية كآخر موضع قراءة للعودة إليها لاحقاً؟
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={confirmSave}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
                >
                  نعم، احفظ
                </button>
                <button 
                  onClick={cancelSave}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ y: -20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.95 }}
              className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
                <Search className="w-6 h-6 text-gray-400" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="ابحث في القرآن الكريم (بدون تشكيل)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent text-lg outline-none font-tajawal"
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToPage(res.page, res.surah.number, res.numberInSurah)}
                        className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <div className="text-lg font-amiri text-primary dark:text-gold mb-2">{res.text}</div>
                        <div className="text-xs text-gray-500 font-tajawal">
                          {res.surah.name} • آية {res.numberInSurah} • صفحة {res.page}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-8 text-center text-gray-500 font-tajawal">لا توجد نتائج مطابقة</div>
                ) : (
                  <div className="p-8 text-center text-gray-400 font-tajawal">اكتب كلمة للبحث في جميع آيات القرآن</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quran Page Viewer */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Mobile Navigation - Top */}
        {!isFocusMode && (
          <div className="flex md:hidden w-full justify-between px-4 mb-2">
            <button 
              onClick={goToNextPage}
              disabled={currentPageNum >= 604}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-tajawal text-primary dark:text-gold"
            >
              <ChevronRight className="w-5 h-5" />
              الصفحة التالية
            </button>
            <button 
              onClick={goToPrevPage}
              disabled={currentPageNum <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-tajawal text-primary dark:text-gold"
            >
              الصفحة السابقة
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isFocusMode && (
          <button 
            onClick={goToNextPage}
            disabled={currentPageNum >= 604}
            className="hidden md:flex p-4 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <motion.div 
          key={currentPageNum}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "relative w-full max-w-3xl bg-[#fdfbf7] dark:bg-[#1a1a1a] rounded-sm shadow-2xl overflow-hidden border-[12px] border-[#e8dcc4] dark:border-[#2a2a2a]",
            isFocusMode ? "min-h-[90vh]" : "min-h-[75vh]"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23c8a951' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        >
          {/* Page Header */}
          <div className="flex justify-between items-center px-8 py-3 border-b-2 border-[#e8dcc4] dark:border-[#2a2a2a] text-[#8b7355] dark:text-[#a68a3d] font-amiri font-bold">
            <span>الجزء {currentJuz}</span>
            <span className="text-xl">{currentSurahName}</span>
            <span>الحزب {Math.ceil(currentHizb / 4)}</span>
          </div>

          {/* Ayahs Content */}
          <div 
            className="p-8 md:p-12 text-justify font-amiri text-black dark:text-gray-100"
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: '2.2',
              textAlignLast: 'center'
            }}
            dir="rtl"
          >
            {currentPageAyahs.map((ayah, idx) => {
              const isFirstAyah = ayah.numberInSurah === 1;
              const isFatihaOrTawbah = ayah.surah.number === 1 || ayah.surah.number === 9;
              const showBismillah = isFirstAyah && !isFatihaOrTawbah;
              
              const ayahText = ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
              const ayahId = `ayah-${ayah.surah.number}-${ayah.numberInSurah}`;
              const isHighlighted = highlightedAyah === ayahId;
              const isLastRead = lastRead?.surah === ayah.surah.number && lastRead?.ayah === ayah.numberInSurah;
              const isPlayingAyah = currentPlayingAyah?.surah === ayah.surah.number && currentPlayingAyah?.ayah === ayah.numberInSurah;

              const words = ayahText.split(' ');
              const lastWord = words.pop();
              const textWithoutLastWord = words.join(' ');

              return (
                <React.Fragment key={ayah.number}>
                  {isFirstAyah && (
                    <div className="w-full text-center my-6 block">
                      <div className="inline-block border-y-2 border-[#c8a951] py-2 px-12 text-2xl font-bold text-[#8b7355] dark:text-[#c8a951] bg-[#c8a951]/10 rounded-full">
                        {ayah.surah.name}
                      </div>
                    </div>
                  )}
                  {showBismillah && (
                    <div className="w-full text-center mb-6 text-2xl text-[#8b7355] dark:text-[#c8a951] block">
                      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </div>
                  )}
                  <span 
                    id={ayahId}
                    onClick={(e) => {
                      handleAyahClick(e, ayah.surah.number, ayah.numberInSurah, ayah.page, ayah.text, ayah.surah.name);
                      if (isContinuousPlay && !selectedAyahInfo) playAyah(ayah.surah.number, ayah.numberInSurah);
                    }}
                    className={cn(
                      "inline transition-colors duration-500 rounded px-1 cursor-pointer",
                      isPlayingAyah ? "bg-primary/20 dark:bg-gold/30 text-primary-dark dark:text-white" :
                      isHighlighted ? "bg-gold/30 dark:bg-gold/40" : 
                      isLastRead ? "bg-primary/10 dark:bg-gold/20 border-b-2 border-primary dark:border-gold" :
                      (selectedAyahInfo?.surah === ayah.surah.number && selectedAyahInfo?.ayah === ayah.numberInSurah) ? "bg-primary/10 dark:bg-gold/20" :
                      "hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                    title="اضغط لإظهار خيارات الآية"
                  >
                    {textWithoutLastWord}{' '}
                    <span className="whitespace-nowrap">
                      {lastWord}
                      {showAyahNumbers && (
                        <span className="relative inline-flex items-center justify-center w-[1.8em] h-[1.8em] mx-2 align-middle">
                          <svg className="absolute inset-0 w-full h-full text-[#8b7355] dark:text-[#c8a951] opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                            <circle cx="50" cy="50" r="42" strokeWidth="3" />
                            <circle cx="50" cy="50" r="34" strokeWidth="1.5" strokeDasharray="4 4" />
                          </svg>
                          <span className="relative text-[0.65em] font-bold text-[#8b7355] dark:text-[#c8a951] pt-0.5">
                            {ayah.numberInSurah}
                          </span>
                        </span>
                      )}
                    </span>
                  </span>
                  {' '}
                </React.Fragment>
              );
            })}
          </div>

          {/* Page Footer */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="font-amiri font-bold text-lg text-[#8b7355] dark:text-[#a68a3d]">
              {currentPageNum}
            </div>
          </div>
        </motion.div>

        {!isFocusMode && (
          <button 
            onClick={goToPrevPage}
            disabled={currentPageNum <= 1}
            className="hidden md:flex p-4 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Mobile Navigation - Bottom */}
        {!isFocusMode && (
          <div className="flex md:hidden w-full justify-between px-4 mt-2">
            <button 
              onClick={goToNextPage}
              disabled={currentPageNum >= 604}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-tajawal text-primary dark:text-gold"
            >
              <ChevronRight className="w-5 h-5" />
              الصفحة التالية
            </button>
            <button 
              onClick={goToPrevPage}
              disabled={currentPageNum <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-tajawal text-primary dark:text-gold"
            >
              الصفحة السابقة
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isFocusMode && (
        <div className="max-w-3xl mx-auto mt-8">
          <div className="flex justify-between text-xs text-gray-500 font-tajawal mb-2 px-2">
            <span>الفاتحة</span>
            <span>الناس</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative cursor-pointer"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const percentage = 1 - (x / rect.width); // RTL
                 const page = Math.max(1, Math.min(604, Math.round(percentage * 604)));
                 jumpToPage(page);
               }}>
            <motion.div 
              className="absolute top-0 right-0 h-full bg-primary dark:bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPageNum / 604) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      {/* Ayah Toolbar */}
      <AyahToolbar 
        ayah={selectedAyahInfo}
        position={toolbarPosition}
        isBookmarked={lastRead?.surah === selectedAyahInfo?.surah && lastRead?.ayah === selectedAyahInfo?.ayah}
        isPlaying={currentPlayingAyah?.surah === selectedAyahInfo?.surah && currentPlayingAyah?.ayah === selectedAyahInfo?.ayah && isPlaying}
        onPlay={() => {
          if (selectedAyahInfo) {
            if (currentPlayingAyah?.surah === selectedAyahInfo.surah && currentPlayingAyah?.ayah === selectedAyahInfo.ayah && isPlaying) {
              togglePlayPause();
            } else {
              playAyah(selectedAyahInfo.surah, selectedAyahInfo.ayah);
            }
          }
        }}
        onBookmark={() => {
          if (selectedAyahInfo) {
            if (lastRead?.surah === selectedAyahInfo.surah && lastRead?.ayah === selectedAyahInfo.ayah) {
              setLastRead(null);
            } else {
              setLastRead({ surah: selectedAyahInfo.surah, ayah: selectedAyahInfo.ayah, page: selectedAyahInfo.page });
            }
          }
        }}
        onShare={() => {
          if (selectedAyahInfo) {
            const textToShare = `"${selectedAyahInfo.text}"\n— سورة ${selectedAyahInfo.surahName} (${selectedAyahInfo.ayah})`;
            if (navigator.share) {
              navigator.share({
                title: 'آية من القرآن الكريم',
                text: textToShare,
              }).catch(console.error);
            } else {
              alert('عذراً، متصفحك لا يدعم ميزة المشاركة المباشرة.');
            }
          }
        }}
        onClose={() => setSelectedAyahInfo(null)}
      />

    </div>
  );
}
