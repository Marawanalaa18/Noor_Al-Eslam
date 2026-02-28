import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Award, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from '@/utils/cn';

interface AchievementShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  userName?: string;
  hijriDate?: string;
}

export function AchievementShareModal({ isOpen, onClose, title, description, userName = 'قارئ القرآن', hijriDate }: AchievementShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `إنجاز-${title.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `achievement.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'إنجازي في تطبيق نور',
          text: `لقد حققت إنجازاً جديداً: ${title} - ${description}`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Failed to share', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-tajawal text-gray-800 dark:text-gray-100">مشاركة الإنجاز</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Card to be captured */}
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-100 dark:border-white/10" ref={cardRef}>
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E] to-[#1a5c47] z-0" />
              <div className="absolute inset-0 opacity-20 z-0" 
                   style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8a951\' fill-opacity=\'1\'%3E%3Cpath d=\'M28 18a12 12 0 0 1-8.5 20.5A12 12 0 1 0 28 18zm8 6l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3l1-3z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              </div>
              
              <div className="relative z-10 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-4 border-2 border-gold/50 shadow-[0_0_30px_rgba(200,169,81,0.3)]">
                  <Award className="w-10 h-10 text-gold" />
                </div>
                
                <h2 className="text-3xl font-bold font-amiri text-white mb-2">{title}</h2>
                <p className="text-gold/90 font-tajawal text-lg mb-6">{description}</p>
                
                <div className="mt-auto w-full pt-6 border-t border-white/10 flex justify-between items-end">
                  <div className="text-right">
                    <p className="text-white/60 text-xs font-tajawal mb-1">أنجز بواسطة</p>
                    <p className="text-white font-bold font-tajawal">{userName}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-white/60 text-xs font-tajawal mb-1">التاريخ</p>
                    <p className="text-white font-bold font-tajawal">{hijriDate || new Date().toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 opacity-50">
                  <span className="text-xl font-bold text-white font-amiri">نور</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-light transition-colors disabled:opacity-70"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                مشاركة
              </button>
              <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-70"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                حفظ الصورة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
