import React, { useState } from "react";
import { Ruler, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportPrintTemplate } from "@/lib/exportPrintTemplate";

const FORMATS = [
  { id: "A4", label: "A4 (210 × 297 mm)", note: "Estándar, varias páginas si la pieza es grande" },
  { id: "A3", label: "A3 (297 × 420 mm)", note: "Recomendado para piezas medianas" },
  { id: "A2", label: "A2 (420 × 594 mm)", note: "Ideal para piezas grandes" },
  { id: "A1", label: "A1 (594 × 841 mm)", note: "Plotter / impresora de gran formato" },
];

export default function PrintTemplateButton({ pieces, dimensions, boxType, material }) {
  const [loading, setLoading] = useState(false);

  const handleExport = (format) => {
    setLoading(true);
    // pequeño timeout para que el spinner aparezca
    setTimeout(() => {
      exportPrintTemplate(pieces, format, dimensions, boxType, material);
      setLoading(false);
    }, 50);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 px-5 text-base gap-2"
          disabled={loading}
          title="Genera una plantilla PDF a escala 1:1 lista para imprimir y recortar"
        >
          <Ruler className="h-4 w-4" />
          {loading ? "Generando…" : "Plantilla 1:1"}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Formato de papel
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FORMATS.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onClick={() => handleExport(f.id)}
            className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
          >
            <span className="font-medium text-sm">{f.label}</span>
            <span className="text-xs text-muted-foreground">{f.note}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground leading-snug">
          💡 Imprime al <strong>100%</strong> sin ajuste de escala para obtener medidas reales exactas.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}