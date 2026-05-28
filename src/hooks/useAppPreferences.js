import { useState, useEffect } from 'react';

const DEFAULT_PREFS = {
  dyslexicFont: false,
  focusMode: false,
  highContrast: false,
  textScale: 1,
};

const STORAGE_KEY = 'app_preferences';

export function useAppPreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs, isLoaded]);

  const toggle = (key) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const update = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
  };

  return { prefs, toggle, update, reset, isLoaded };
}