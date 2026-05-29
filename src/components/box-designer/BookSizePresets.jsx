import React from "react";
import { Button } from "@/components/ui/button";

// Formatos estándar de libro en mm: alto × ancho × profundidad (lomo)
const PRESETS = [
  { label: "A4", alto: 297, ancho: 210, profundidad: 25 },
  { label: "A5", alto: 210, ancho: 148, profundidad: 20 },
  { label: "Cuarto", alto: 240, ancho: 170, profundidad: 30 },
  { label: "Folio", alto: 330, ancho: 220, profundidad: 35 },
  { label: "Bolsillo", alto: 180, ancho: 110, profundidad: 15 },
  { label: "Cuadrado", alto: 200, ancho: 200, profundidad: 20 },
];

export default function BookSizePresets({ onSelect }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        Formatos comunes — haz clic para rellenar
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect({ alto: p.alto, ancho: p.ancho, profundidad: p.profundidad })}
            className="text-xs h-8 px-3 border-border/60 hover:border-primary hover:text-primary transition-colors"
          >
            {p.label}
            <span className="ml-1.5 text-muted-foreground font-normal">
              {p.alto}×{p.ancho}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}