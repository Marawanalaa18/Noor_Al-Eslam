import { useState, useEffect } from 'react';
import { islamicApi } from '@/utils/api';
import { useLocalStorage } from './useLocalStorage';
import { useGeolocation } from './useGeolocation';
import { PrayerTimings } from '@/pages/PrayerTimes';

export function usePrayerTimes() {
  const [timings, setTimings] = useLocalStorage<PrayerTimings | null>('prayerTimings', null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude } = useGeolocation();
  const [method] = useLocalStorage<number>('prayerMethod', 5);
  const [hijriAdjustment] = useLocalStorage<number>('hijriAdjustment', 0);

  useEffect(() => {
    const fetchTimings = async () => {
      if (!latitude || !longitude) return;
      
      try {
        setLoading(true);
        const response = await islamicApi.get('/timings', {
          params: {
            latitude,
            longitude,
            method,
            adjustment: hijriAdjustment
          }
        });
        setTimings(response.data.data.timings);
      } catch (err) {
        setError('Failed to fetch prayer times');
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, [latitude, longitude, method, hijriAdjustment]);

  return { timings, loading, error };
}
