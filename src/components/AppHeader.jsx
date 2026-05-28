import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Type, Eye, Lightbulb, Plus, Minus, RotateCcw } from 'lucide-react';
import { useAppPreferences } from '@/hooks/useAppPreferences';

export default function AppHeader() {
  const { prefs, toggle, update, reset } = useAppPreferences();

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey) return;

      switch (e.code) {
        case 'KeyD':
          e.preventDefault();
          toggle('dyslexicFont');
          break;
        case 'KeyF':
          e.preventDefault();
          toggle('focusMode');
          break;
        case 'KeyC':
          e.preventDefault();
          toggle('highContrast');
          break;
        case 'Equal':
        case 'NumpadAdd':
          e.preventDefault();
          update('textScale', Math.min(prefs.textScale + 0.2, 2));
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          update('textScale', Math.max(prefs.textScale - 0.2, 0.8));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prefs, toggle, update]);

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground">Accesibilidad</h1>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dyslexic Font */}
          <Button
            variant={prefs.dyslexicFont ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggle('dyslexicFont')}
            title="Alt + D"
            className="h-8 px-3"
          >
            <Type className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Dislexia</span>
          </Button>

          {/* Focus Mode */}
          <Button
            variant={prefs.focusMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggle('focusMode')}
            title="Alt + F"
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Enfoque</span>
          </Button>

          {/* High Contrast */}
          <Button
            variant={prefs.highContrast ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggle('highContrast')}
            title="Alt + C"
            className="h-8 px-3"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Contraste</span>
          </Button>

          {/* Text Scale */}
          <div className="flex items-center gap-1 border border-border rounded-md px-2 bg-secondary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update('textScale', Math.max(prefs.textScale - 0.2, 0.8))}
              title="Alt + -"
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xs font-mono text-muted-foreground w-8 text-center">
              {prefs.textScale.toFixed(1)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update('textScale', Math.min(prefs.textScale + 0.2, 2))}
              title="Alt + +"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            title="Restablecer preferencias"
            className="h-8 px-3"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Reset</span>
          </Button>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground col-span-full text-center">
          Usa Alt + tecla para atajos rápidos
        </p>
      </div>
    </div>
  );
}