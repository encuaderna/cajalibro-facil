import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Glasses, Eye, Lightbulb, Zap, Type } from 'lucide-react';

const FEATURES = [
  {
    icon: Type,
    title: 'Fuente Dislexia-Friendly',
    description: 'Fuente OpenDyslexic optimizada para mayor legibilidad',
    shortcut: 'Alt + D',
  },
  {
    icon: Eye,
    title: 'Modo Enfoque',
    description: 'Reduce distracciones en la interfaz',
    shortcut: 'Alt + F',
  },
  {
    icon: Lightbulb,
    title: 'Alto Contraste',
    description: 'Aumenta el contraste para mejor visibilidad',
    shortcut: 'Alt + C',
  },
  {
    icon: Zap,
    title: 'Escala de Texto',
    description: 'Ajusta el tamaño del texto a tu preferencia',
    shortcut: 'Alt + ±',
  },
];

export default function Welcome({ onGetStarted }) {
  const [animateIn, setAnimateIn] = useState(false);

  React.useEffect(() => {
    setAnimateIn(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Glasses className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Diseño Técnico</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Herramienta accesible para cálculo de cajas personalizadas
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            const delay = idx * 100;
            return (
              <div
                key={idx}
                className={`p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 ${
                  animateIn
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${delay}ms`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </p>
                    <p className="text-xs font-mono text-primary">
                      {feature.shortcut}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div
          className={`p-6 rounded-lg bg-secondary/50 border border-border/50 mb-8 transition-all duration-700 ${
            animateIn
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <h2 className="font-semibold text-foreground mb-2">🎯 Accesibilidad Primera</h2>
          <p className="text-sm text-muted-foreground">
            Esta aplicación está diseñada pensando en todos. Usa los controles de accesibilidad en la parte superior para personalizar tu experiencia según tus necesidades.
          </p>
        </div>

        {/* CTA Button */}
        <div
          className={`text-center transition-all duration-700 ${
            animateIn
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <Button
            onClick={onGetStarted}
            className="h-12 px-8 text-base font-medium"
          >
            Empezar →
          </Button>
        </div>
      </div>
    </div>
  );
}