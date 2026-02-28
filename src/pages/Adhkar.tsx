import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Loader2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/utils/cn';
import { islamicApi } from '@/utils/api';
import { useProgress } from '@/hooks/useProgress';

interface AdhkarItem {
  id: number;
  category: string;
  text: string;
  text_without_diacritical: string;
  description: string;
  count: number;
  reference: string;
}

const ProgressRing = ({ current, total, onClick, isDone }: { current: number, total: number, onClick: () => void, isDone: boolean }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = current / total;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileTap={!isDone ? { scale: 0.9 } : {}}
        animate={isDone ? { 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, -5, 5, 0]
        } : {}}
        transition={{ duration: 0.5 }}
        onClick={onClick}
        disabled={isDone}
        className={cn(
          "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 outline-none",
          isDone ? "shadow-[0_0_30px_rgba(200,169,81,0.4)] bg-gold/5" : "hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10"
        )}
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
            className={cn(
              "transition-colors duration-300",
              isDone ? "text-[#c8a951]" : "text-primary dark:text-primary-light"
            )}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isDone ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Check className="w-8 h-8 text-[#c8a951]" />
            </motion.div>
          ) : (
            <div className="flex items-baseline gap-1 font-mono" dir="ltr">
              <span className="text-2xl font-bold text-primary dark:text-gold">{current}</span>
              <span className="text-sm text-gray-400">/{total}</span>
            </div>
          )}
        </div>
      </motion.button>
      
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence>
          {isDone && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-bold text-[#c8a951] font-tajawal bg-gold/10 px-3 py-1 rounded-full"
            >
              بارك الله فيك ✨
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export function Adhkar() {
  const [activeTab, setActiveTab] = useState<string>('أذكار الصباح');
  const [adhkarData, setAdhkarData] = useState<Record<string, AdhkarItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState<Record<number, number>>({});
  const { addAdhkar } = useProgress();

  useEffect(() => {
    islamicApi.get('/adkar.json').then(res => {
      const data: AdhkarItem[] = res.data;
      const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = [];
        }
        acc[curr.category].push(curr);
        return acc;
      }, {} as Record<string, AdhkarItem[]>);
      
      setAdhkarData(grouped);
      if (Object.keys(grouped).length > 0) {
        setActiveTab(Object.keys(grouped)[0]);
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  const advanceToNext = (currentId: number) => {
    const currentList = adhkarData[activeTab] || [];
    const currentIndex = currentList.findIndex(d => d.id === currentId);
    if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
      const nextId = currentList[currentIndex + 1].id;
      const nextElement = document.getElementById(`zikr-${nextId}`);
      if (nextElement) {
        // Add a small highlight effect to the next element
        nextElement.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'dark:ring-offset-gray-900');
        setTimeout(() => {
          nextElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'dark:ring-offset-gray-900');
        }, 1500);
        
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCount = (id: number, targetCount: number) => {
    const current = counters[id] || 0;
    if (current < targetCount) {
      const newCount = current + 1;
      setCounters(prev => ({ ...prev, [id]: newCount }));
      
      if (newCount === targetCount) {
        addAdhkar(1);
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c8a951', '#f1d570', '#ffffff'],
          disableForReducedMotion: true
        });
        
        // Auto-advance after a short delay
        setTimeout(() => {
          advanceToNext(id);
        }, 1200);
      }
    }
  };

  const handleReset = () => {
    setCounters({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary dark:text-gold" />
      </div>
    );
  }

  const categories = Object.keys(adhkarData);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">الأذكار</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              handleReset();
            }}
            className={cn(
              "flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all shadow-md snap-center",
              activeTab === cat 
                ? "bg-primary text-white" 
                : "glass hover:bg-white/20 text-gray-600 dark:text-gray-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {adhkarData[activeTab]?.map((dhikr, idx) => {
          const currentCount = counters[dhikr.id] || 0;
          const isDone = currentCount >= dhikr.count;

          return (
            <motion.div
              id={`zikr-${dhikr.id}`}
              key={dhikr.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group transition-all duration-500",
                isDone ? "opacity-70 bg-gray-50 dark:bg-white/5 scale-[0.98]" : "hover:shadow-xl"
              )}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 dark:bg-gold/5 rounded-bl-full flex items-start justify-end p-4">
                <Star className={cn("w-4 h-4 transition-colors", isDone ? "text-gold" : "text-primary/40 dark:text-gold/40")} />
              </div>
              
              <p className={cn(
                "text-xl md:text-2xl leading-relaxed font-amiri mb-6 text-justify whitespace-pre-line transition-colors",
                isDone ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-100"
              )}>
                {dhikr.text}
              </p>
              
              {dhikr.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-tajawal bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                  {dhikr.description}
                </p>
              )}
              
              <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 dark:border-white/5 pt-6 gap-6">
                <div className="flex flex-col gap-2 text-center md:text-right w-full md:w-auto">
                  {dhikr.reference && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full inline-block w-fit mx-auto md:mx-0">
                      المصدر: {dhikr.reference}
                    </span>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <ProgressRing 
                    current={currentCount} 
                    total={dhikr.count} 
                    onClick={() => handleCount(dhikr.id, dhikr.count)}
                    isDone={isDone}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
