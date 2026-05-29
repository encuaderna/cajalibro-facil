import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Lightbulb } from "lucide-react";

const TOUR_KEY = "box_designer_tour_done";

const STEPS = [
  {
    title: "Bienvenido al Diseñador",
    body: "Este asistente te ayuda a calcular todas las piezas para fabricar una caja de libro a medida. Solo necesitas 3 datos: las medidas del libro, el tipo de caja y el material.",
    icon: "📦",
  },
  {
    title: "Paso 1 — Dimensiones",
    body: "Introduce el alto, ancho y profundidad (lomo) del libro en milímetros. Puedes usar los atajos de formatos comunes como A4, A5 o Cuarto.",
    icon: "📏",
  },
  {
    title: "Paso 2 — Tipo de caja",
    body: "Selecciona la estructura: estuche, clamshell, tapa abatible... Al hacer clic en cada opción verás su descripción y para qué es ideal.",
    icon: "🗂️",
  },
  {
    title: "Paso 3 — Material",
    body: "Elige el material de fabricación. El grosor afecta a las medidas finales de cada pieza. Si supera 3 mm, se indicará el corte a 45° necesario.",
    icon: "🪵",
  },
  {
    title: "Paso 4 — Resultados",
    body: "Obtienes la tabla de corte, optimizador de láminas, estimación de coste, visor 3D y varios formatos de exportación. Puedes guardar el proyecto y recuperarlo cuando quieras.",
    icon: "✅",
  },
];

export default function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      close();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setStepIdx(0); setOpen(true); }}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title="Ver tutorial"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Tutorial
      </button>
    );
  }

  const step = STEPS[stepIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl p-6">
        <button
          onClick={close}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-4xl mb-3">{step.icon}</div>
        <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{step.body}</p>

        <div className="flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? "w-5 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <Button size="sm" onClick={next} className="gap-1.5">
            {stepIdx < STEPS.length - 1 ? (
              <>Siguiente <ArrowRight className="h-3.5 w-3.5" /></>
            ) : (
              "¡Empezar!"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}