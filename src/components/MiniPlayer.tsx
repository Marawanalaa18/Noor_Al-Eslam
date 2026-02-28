import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, Headphones } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Link, useLocation } from 'react-router-dom';

export function MiniPlayer() {
  const { isPlaying, currentSurah, currentReciter, togglePlayPause, progress, duration, stopAudio } = useAudio();
  const location = useLocation();

  // Don't show mini player on the main audio page
  if (location.pathname === '/audio') return null;

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopAudio();
  };

  return (
    <AnimatePresence>
      {(currentSurah && (isPlaying || progress > 0)) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50"
        >
          <Link to="/audio" className="block glass-card rounded-2xl p-4 shadow-2xl border border-primary/20 dark:border-gold/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-primary dark:text-gold" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold font-amiri text-lg truncate text-gray-900 dark:text-white">
                  {currentSurah.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-tajawal">
                  {currentReciter?.name}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary dark:bg-gold transition-all duration-300"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
