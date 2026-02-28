import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { alquranApi } from '@/utils/api';

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
}

export interface QuranData {
  surahs: any[];
  ayahs: Ayah[];
  pages: Record<number, Ayah[]>;
  surahStartPages: Record<number, number>;
}

export function useQuranData() {
  const [data, setData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuran = async () => {
      try {
        const cached = await get('quran-uthmani');
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        const res = await alquranApi.get('/quran/quran-uthmani');
        const surahs = res.data.data.surahs;
        
        const ayahs: Ayah[] = [];
        const pages: Record<number, Ayah[]> = {};
        const surahStartPages: Record<number, number> = {};

        surahs.forEach((surah: any) => {
          surah.ayahs.forEach((ayah: any) => {
            const ayahWithSurah = { ...ayah, surah: {
              number: surah.number,
              name: surah.name,
              englishName: surah.englishName,
              englishNameTranslation: surah.englishNameTranslation,
              revelationType: surah.revelationType,
              numberOfAyahs: surah.ayahs.length
            }};
            ayahs.push(ayahWithSurah);
            
            if (!pages[ayah.page]) {
              pages[ayah.page] = [];
            }
            pages[ayah.page].push(ayahWithSurah);

            if (ayah.numberInSurah === 1) {
              surahStartPages[surah.number] = ayah.page;
            }
          });
        });

        const quranData: QuranData = { surahs, ayahs, pages, surahStartPages };
        await set('quran-uthmani', quranData);
        setData(quranData);
      } catch (err: any) {
        console.error('Failed to fetch Quran data:', err);
        setError(err.message || 'Failed to load Quran data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuran();
  }, []);

  return { data, loading, error };
}
