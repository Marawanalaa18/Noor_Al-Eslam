import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Copy, Bookmark, Share2, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AyahInfo {
  surah: number;
  ayah: number;
  page: number;
  text: string;
  surahName: string;
}

interface AyahToolbarProps {
  ayah: AyahInfo | null;
  position: { top: number; left: number } | null;
  isBookmarked: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onClose: () => void;
}

export function AyahToolbar({
  ayah,
  position,
  isBookmarked,
  isPlaying,
  onPlay,
  onBookmark,
  onShare,
  onClose
}: AyahToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ayah) return;
      if (e.key.toLowerCase() === 'c') {
        handleCopy();
      } else if (e.key.toLowerCase() === 'b') {
        onBookmark();
      } else if (e.key.toLowerCase() === 'p') {
        onPlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ayah, onBookmark, onPlay, onClose]);

  const handleCopy = async () => {
    if (!ayah) return;
    const textToCopy = `"${ayah.text}"\n— سورة ${ayah.surahName} (${ayah.ayah})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!ayah || !position) return null;

  const style: React.CSSProperties = isMobile 
    ? {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'calc(100% - 48px)',
        maxWidth: '320px'
      }
    : {
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%) translateY(-10px)',
        zIndex: 100,
      };

  return (
    <>
      <AnimatePresence>
        {ayah && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={style}
            className={cn(
              "flex items-center justify-center gap-1 p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
              "bg-white/80 dark:bg-black/60 backdrop-blur-md border border-white/40 dark:border-white/10",
              isMobile ? "mx-auto" : ""
            )}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <ToolbarButton 
              icon={isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />} 
              label={isPlaying ? "إيقاف" : "تشغيل"} 
              onClick={onPlay} 
              active={isPlaying}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
              label="نسخ" 
              onClick={handleCopy} 
              active={copied}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={<Bookmark className="w-4 h-4" />} 
              label="حفظ" 
              onClick={onBookmark} 
              active={isBookmarked}
            />
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton 
              icon={<Share2 className="w-4 h-4" />} 
              label="مشاركة" 
              onClick={onShare} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-tajawal flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            تم نسخ الآية بنجاح
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToolbarButton({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors",
        active 
          ? "text-gold bg-gold/10" 
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
      )}
      title={label}
    >
      {icon}
      <span className="text-[10px] mt-1 font-tajawal opacity-80">{label}</span>
    </button>
  );
}
