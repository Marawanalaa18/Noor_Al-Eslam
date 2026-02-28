import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Moon, Sun, Menu, X, BookOpen, Headphones, Clock, Heart, Activity, Target, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = () => setIsDark(!isDark);

    const links = [
      { name: 'الرئيسية', path: '/', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'مواقيت الصلاة', path: '/prayer-times', icon: <Clock className="w-5 h-5" /> },
      { name: 'القرآن الكريم', path: '/quran', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'استمع للقرآن', path: '/audio', icon: <Headphones className="w-5 h-5" /> },
      { name: 'الأذكار', path: '/adhkar', icon: <Heart className="w-5 h-5" /> },
      { name: 'السنن النبوية', path: '/sunnah', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'المتابعة اليومية', path: '/tracker', icon: <Activity className="w-5 h-5" /> },
      { name: 'الإعدادات', path: '/settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 rounded-b-2xl",
        isScrolled 
          ? "glass-card shadow-lg border-b border-white/20 dark:border-white/10" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex justify-between items-center transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gradient font-amiri">نور</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary dark:hover:text-gold py-2",
                    isActive ? "text-primary dark:text-gold" : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary dark:bg-gold rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-2"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-card border-t-0 rounded-b-2xl shadow-lg mt-1">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors relative overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-navbar-indicator"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-primary dark:bg-gold rounded-l-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
