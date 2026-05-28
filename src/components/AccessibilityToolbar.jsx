import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Type,
  AlignJustify,
  Sun,
  Moon,
  Minus,
  RotateCcw,
  X,
} from "lucide-react";

const DEFAULTS = {
  fontSize: 100,    // % base
  lineHeight: 1.5,  // em
  letterSpacing: 0, // em
  highContrast: false,
  reducedMotion: false,
};

const FONT_STEP = 10;    // % por pulsación
const LINE_STEP = 0.15;
const LETTER_STEP = 0.03;

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("a11y-settings");
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Aplicar ajustes al <html> para que afecten a toda la app
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontSize}%`;
    root.style.lineHeight = String(settings.lineHeight);
    root.style.letterSpacing = `${settings.letterSpacing}em`;

    if (settings.highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    if (settings.reducedMotion) {
      root.classList.add("a11y-reduce-motion");
    } else {
      root.classList.remove("a11y-reduce-motion");
    }

    try {
      localStorage.setItem("a11y-settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const reset = () => setSettings(DEFAULTS);

  const isDefault =
    settings.fontSize === DEFAULTS.fontSize &&
    settings.lineHeight === DEFAULTS.lineHeight &&
    settings.letterSpacing === DEFAULTS.letterSpacing &&
    !settings.highContrast &&
    !settings.reducedMotion;

  return (
    <>
      {/* Inyectar estilos globales de accesibilidad */}
      <style>{`
        .a11y-high-contrast {
          --background: 0 0% 0% !important;
          --foreground: 0 0% 100% !important;
          --card: 0 0% 5% !important;
          --card-foreground: 0 0% 100% !important;
          --muted-foreground: 0 0% 80% !important;
          --border: 0 0% 60% !important;
          --primary: 60 100% 55% !important;
          --primary-foreground: 0 0% 0% !important;
          --secondary: 0 0% 12% !important;
          --destructive: 0 100% 65% !important;
        }
        .a11y-reduce-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>

      {/* Botón flotante de accesibilidad */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Herramientas de accesibilidad"
            className="bg-card border border-border rounded-xl shadow-2xl p-4 w-72 space-y-4"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Accessibility className="h-4 w-4 text-primary" />
                Accesibilidad
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar panel de accesibilidad"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <hr className="border-border" />

            {/* Tamaño de fuente */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Tamaño de texto ({settings.fontSize}%)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Reducir tamaño de texto"
                  disabled={settings.fontSize <= 70}
                  onClick={() =>
                    update("fontSize", Math.max(70, settings.fontSize - FONT_STEP))
                  }
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div
                  className="flex-1 bg-secondary rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={settings.fontSize}
                  aria-valuemin={70}
                  aria-valuemax={160}
                  aria-label={`Tamaño actual ${settings.fontSize}%`}
                >
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${((settings.fontSize - 70) / 90) * 100}%`,
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Aumentar tamaño de texto"
                  disabled={settings.fontSize >= 160}
                  onClick={() =>
                    update("fontSize", Math.min(160, settings.fontSize + FONT_STEP))
                  }
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Interlineado */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Interlineado ({settings.lineHeight.toFixed(2)})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Reducir interlineado"
                  disabled={settings.lineHeight <= 1.2}
                  onClick={() =>
                    update(
                      "lineHeight",
                      parseFloat(Math.max(1.2, settings.lineHeight - LINE_STEP).toFixed(2))
                    )
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div
                  className="flex-1 bg-secondary rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={settings.lineHeight}
                  aria-valuemin={1.2}
                  aria-valuemax={2.5}
                >
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${((settings.lineHeight - 1.2) / 1.3) * 100}%`,
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Aumentar interlineado"
                  disabled={settings.lineHeight >= 2.5}
                  onClick={() =>
                    update(
                      "lineHeight",
                      parseFloat(Math.min(2.5, settings.lineHeight + LINE_STEP).toFixed(2))
                    )
                  }
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Espaciado entre letras */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Espaciado de letras ({settings.letterSpacing.toFixed(2)} em)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Reducir espaciado de letras"
                  disabled={settings.letterSpacing <= 0}
                  onClick={() =>
                    update(
                      "letterSpacing",
                      parseFloat(Math.max(0, settings.letterSpacing - LETTER_STEP).toFixed(2))
                    )
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div
                  className="flex-1 bg-secondary rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={settings.letterSpacing}
                  aria-valuemin={0}
                  aria-valuemax={0.3}
                >
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(settings.letterSpacing / 0.3) * 100}%`,
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Aumentar espaciado de letras"
                  disabled={settings.letterSpacing >= 0.3}
                  onClick={() =>
                    update(
                      "letterSpacing",
                      parseFloat(Math.min(0.3, settings.letterSpacing + LETTER_STEP).toFixed(2))
                    )
                  }
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <hr className="border-border" />

            {/* Interruptores de modo */}
            <div className="space-y-2">
              {/* Alto contraste */}
              <button
                onClick={() => update("highContrast", !settings.highContrast)}
                aria-pressed={settings.highContrast}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors text-sm ${
                  settings.highContrast
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground hover:border-muted-foreground/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  {settings.highContrast ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  Alto contraste
                </span>
                <span
                  className={`w-8 h-4 rounded-full transition-colors ${
                    settings.highContrast ? "bg-primary" : "bg-muted"
                  } relative`}
                >
                  <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                      settings.highContrast ? "left-4" : "left-0.5"
                    }`}
                  />
                </span>
              </button>

              {/* Reducir movimiento */}
              <button
                onClick={() => update("reducedMotion", !settings.reducedMotion)}
                aria-pressed={settings.reducedMotion}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors text-sm ${
                  settings.reducedMotion
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground hover:border-muted-foreground/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  Reducir animaciones
                </span>
                <span
                  className={`w-8 h-4 rounded-full transition-colors ${
                    settings.reducedMotion ? "bg-primary" : "bg-muted"
                  } relative`}
                >
                  <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                      settings.reducedMotion ? "left-4" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Restablecer */}
            {!isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="w-full text-xs"
                aria-label="Restablecer todos los ajustes de accesibilidad"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Restablecer ajustes
              </Button>
            )}
          </div>
        )}

        {/* Botón activador */}
        <Button
          onClick={() => setOpen((v) => !v)}
          aria-label={
            open
              ? "Cerrar herramientas de accesibilidad"
              : "Abrir herramientas de accesibilidad"
          }
          aria-expanded={open}
          aria-haspopup="dialog"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}