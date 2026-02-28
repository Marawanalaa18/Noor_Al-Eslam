import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-8 mt-12 border-t border-gray-200 dark:border-white/10 glass-card rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold text-gradient font-amiri">
          نور
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          صُنع بحب <Heart className="w-4 h-4 text-red-500 fill-current" /> للمسلمين في كل مكان
        </p>
      </div>
    </footer>
  );
}
