/**
 * useLocalDraft — persiste el progreso del wizard en localStorage.
 * Guarda automáticamente cada vez que cambia algún valor relevante.
 */
import { useEffect, useCallback } from "react";

const KEY = "box_designer_draft";

export function saveDraft({ step, dimensions, boxType, material }) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ step, dimensions, boxType, material, savedAt: Date.now() })
    );
  } catch (_) {}
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch (_) {}
}

export function hasDraft() {
  return !!localStorage.getItem(KEY);
}

/**
 * Hook que auto-guarda el borrador cada 3 segundos.
 * Sólo guarda si hay algo útil (paso > 1 o alguna dimensión > 0).
 */
export function useAutoSaveDraft({ step, dimensions, boxType, material }) {
  useEffect(() => {
    const hasData =
      step > 1 ||
      dimensions.alto > 0 ||
      dimensions.ancho > 0 ||
      dimensions.profundidad > 0;

    if (!hasData) return;

    // Guardar inmediatamente al montar
    saveDraft({ step, dimensions, boxType, material });

    // Luego guardar cada 3 segundos
    const interval = setInterval(() => {
      saveDraft({ step, dimensions, boxType, material });
    }, 3000);

    return () => clearInterval(interval);
  }, [step, dimensions, boxType, material]);
}