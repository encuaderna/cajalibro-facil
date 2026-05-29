import React from "react";
import { Check, Dot } from "lucide-react";

export default function SummaryBar({ step, dimensions, boxType, material }) {
  const hasAll = dimensions.alto > 0 && dimensions.ancho > 0 && dimensions.profundidad > 0;

  const items = [
    {
      label: "Libro",
      value: hasAll
        ? `${dimensions.alto}×${dimensions.ancho}×${dimensions.profundidad} mm`
        : null,
      done: hasAll,
    },
    {
      label: "Tipo",
      value: boxType?.name ?? null,
      done: !!boxType,
    },
    {
      label: "Material",
      value: material ? `${material.name} (${material.thickness} mm)` : null,
      done: !!material,
    },
  ];

  // Solo mostrar si al menos uno tiene valor
  if (!hasAll && !boxType && !material) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6 px-3 py-2 rounded-lg bg-secondary/60 border border-border/50">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          {item.done ? (
            <Check className="h-3 w-3 text-primary shrink-0" />
          ) : (
            <Dot className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          <span className="text-muted-foreground">{item.label}:</span>
          <span className={item.done ? "text-foreground font-medium" : "text-muted-foreground italic"}>
            {item.value ?? "—"}
          </span>
          {i < items.length - 1 && (
            <span className="text-border ml-1">·</span>
          )}
        </div>
      ))}
    </div>
  );
}