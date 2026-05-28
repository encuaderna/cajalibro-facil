import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const fields = [
  { key: "alto", label: "Alto del libro (mm)", placeholder: "Ej: 240" },
  { key: "ancho", label: "Ancho del libro (mm)", placeholder: "Ej: 170" },
  { key: "profundidad", label: "Profundidad / Lomo (mm)", placeholder: "Ej: 30" },
];

export default function StepDimensions({ dimensions, onChange, onNext }) {
  const allValid =
    dimensions.alto > 0 && dimensions.ancho > 0 && dimensions.profundidad > 0;

  const handleChange = (key, value) => {
    const num = parseFloat(value);
    onChange({ ...dimensions, [key]: isNaN(num) || num < 0 ? 0 : num });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Paso 1 — Dimensiones del libro
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Introduce las medidas del libro en milímetros.
      </p>

      <div className="space-y-6 max-w-md">
        {fields.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key} className="text-sm font-medium text-foreground">
              {f.label}
            </Label>
            <Input
              id={f.key}
              type="number"
              min="1"
              step="0.1"
              placeholder={f.placeholder}
              value={dimensions[f.key] || ""}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="h-12 text-base bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Button
          onClick={onNext}
          disabled={!allValid}
          className="h-12 px-8 text-base font-medium"
        >
          Siguiente
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}