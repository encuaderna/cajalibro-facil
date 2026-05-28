import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MATERIALS } from "@/lib/boxCalculations";

export default function StepMaterial({ selectedMaterial, onSelect, onNext, onBack }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Paso 3 — Material
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Selecciona el material y grosor para la caja.
      </p>

      <div className="space-y-3 max-w-lg">
        {MATERIALS.map((mat) => {
          const isSelected = selectedMaterial?.id === mat.id;
          return (
            <button
              key={mat.id}
              onClick={() => onSelect(mat)}
              className={`w-full text-left p-5 rounded-lg border-2 transition-colors flex items-center justify-between ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary hover:border-muted-foreground/30"
              }`}
              aria-pressed={isSelected}
            >
              <span className="text-base font-medium text-foreground">
                {mat.name}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {mat.thickness} mm
              </span>
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
          disabled={!selectedMaterial}
          className="h-12 px-8 text-base font-medium"
        >
          Calcular piezas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}