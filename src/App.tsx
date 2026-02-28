/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { PrayerTimes } from './pages/PrayerTimes';
import { Quran } from './pages/Quran';
import { Audio } from './pages/Audio';
import { Adhkar } from './pages/Adhkar';
import { Sunnah } from './pages/Sunnah';
import { Settings } from './pages/Settings';
import { Tracker } from './pages/Tracker';
import { AudioProvider } from './contexts/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="prayer-times" element={<PrayerTimes />} />
            <Route path="quran" element={<Quran />} />
            <Route path="audio" element={<Audio />} />
            <Route path="adhkar" element={<Adhkar />} />
            <Route path="sunnah" element={<Sunnah />} />
            <Route path="tracker" element={<Tracker />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
}
