import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BOX_TYPES } from "@/lib/boxCalculations";

export default function StepBoxType({ selectedType, onSelect, onNext, onBack }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Paso 2 — Tipo de caja
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Selecciona el tipo de estructura que necesitas.
      </p>

      <div className="space-y-4 max-w-lg">
        {BOX_TYPES.map((box) => {
          const isSelected = selectedType?.id === box.id;
          return (
            <button
              key={box.id}
              onClick={() => onSelect(box)}
              className={`w-full text-left p-5 rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary hover:border-muted-foreground/30"
              }`}
              aria-pressed={isSelected}
            >
              <span className="block text-base font-medium text-foreground mb-1">
                {box.name}
              </span>
              {isSelected && (
                <span className="block text-sm text-muted-foreground leading-relaxed mt-2">
                  {box.description}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 text-base">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedType}
          className="h-12 px-8 text-base font-medium"
        >
          Siguiente
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}