import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Star, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { islamicApi } from '@/utils/api';

interface SunnahItem {
  id: string;
  title: string;
  hadith: string;
  source: string;
  description: string;
  reward: string;
}

interface SunnahCategory {
  id: string;
  label: string;
  icon: string;
}

interface SunnahData {
  categories: SunnahCategory[];
  content: Record<string, Record<string, SunnahItem[]>>;
}

export function Sunnah() {
  const [data, setData] = useState<SunnahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('عام');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    islamicApi.get('/sunnah_data.json').then(res => {
      setData(res.data);
      setLoading(false);
      
      // Set initial active category to the first key in content
      if (res.data.content) {
        const firstCat = Object.keys(res.data.content)[0];
        setActiveCategory(firstCat);
        
        // Set first section as expanded
        const firstSection = Object.keys(res.data.content[firstCat])[0];
        setExpandedSection(firstSection);
      }
    }).catch(console.error);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary dark:text-gold" />
      </div>
    );
  }

  const categories = Object.keys(data.content);
  const currentSections = data.content[activeCategory] || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-gradient">السنن النبوية</h1>
        <p className="text-gray-500 dark:text-gray-400 font-tajawal">وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ</p>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              const firstSection = Object.keys(data.content[cat])[0];
              setExpandedSection(firstSection);
            }}
            className={cn(
              "flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all shadow-md snap-center",
              activeCategory === cat 
                ? "bg-primary text-white" 
                : "glass hover:bg-white/20 text-gray-600 dark:text-gray-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(currentSections as Record<string, SunnahItem[]>).map(([sectionName, items]) => (
          <div key={sectionName} className="glass-card rounded-3xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === sectionName ? null : sectionName)}
              className="w-full flex items-center justify-between p-6 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-colors"
            >
              <h2 className="text-2xl font-bold font-tajawal text-primary dark:text-gold">
                {sectionName}
              </h2>
              {expandedSection === sectionName ? (
                <ChevronUp className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-500" />
              )}
            </button>
            
            {expandedSection === sectionName && (
              <div className="p-6 space-y-6">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 relative group"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 dark:bg-gold/5 rounded-bl-full flex items-start justify-end p-3">
                      <Book className="w-4 h-4 text-primary/40 dark:text-gold/40" />
                    </div>
                    
                    <h3 className="text-xl font-bold font-tajawal mb-3 text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h3>
                    
                    <p className="text-lg leading-relaxed font-amiri text-primary-dark dark:text-gold-light mb-4 text-justify">
                      "{item.hadith}"
                    </p>
                    
                    <div className="space-y-2 text-sm font-tajawal">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-gray-800 dark:text-gray-100">الشرح: </span>
                        {item.description}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        <span className="font-bold">الثواب: </span>
                        {item.reward}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
                        المصدر: {item.source}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
