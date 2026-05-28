import React, { useState, useMemo } from "react";
import { optimizeSheet, SHEET_SIZES } from "@/lib/sheetOptimizer";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Paleta de colores por índice de pieza
const PALETTE = [
  "#2a5298", "#1a7a4a", "#7a2a1a", "#6a3a8a", "#1a6a7a",
  "#7a6a1a", "#3a6a2a", "#8a2a5a", "#2a6a5a", "#5a3a1a",
];

function colorFor(idx) {
  return PALETTE[idx % PALETTE.length];
}

export default function SheetOptimizer({ pieces }) {
  const [sheetId, setSheetId] = useState(SHEET_SIZES[0].id);
  const [open, setOpen] = useState(false);

  const sheet = SHEET_SIZES.find((s) => s.id === sheetId);

  const result = useMemo(
    () => optimizeSheet(pieces, sheet),
    [pieces, sheet]
  );

  // Escala para el SVG: ajustar la lámina al ancho disponible (~560px max)
  const SVG_MAX_W = 560;
  const SVG_MAX_H = 400;
  const scaleX = SVG_MAX_W / sheet.w;
  const scaleY = SVG_MAX_H / sheet.h;
  const scale  = Math.min(scaleX, scaleY);
  const svgW   = Math.round(sheet.w * scale);
  const svgH   = Math.round(sheet.h * scale);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabecera colapsable */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="sheet-optimizer-body"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Optimización de corte en lámina
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id="sheet-optimizer-body" className="p-4 space-y-4">

          {/* Selector de lámina */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lámina estándar:
            </span>
            {SHEET_SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSheetId(s.id)}
                aria-pressed={sheetId === s.id}
                className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                  sheetId === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Aprovechamiento" value={`${result.efficiency.toFixed(1)}%`} highlight />
            <Stat label="Láminas necesarias" value={result.sheetsNeeded} />
            <Stat
              label="Área útil"
              value={`${(result.usedArea / 1e6).toFixed(3)} m²`}
            />
            <Stat
              label="Desperdicio"
              value={`${(((result.sheetArea - result.usedArea) / result.sheetArea) * 100).toFixed(1)}%`}
              warn={result.efficiency < 60}
            />
          </div>

          {result.unplacedCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              ⚠ {result.unplacedCount} pieza{result.unplacedCount > 1 ? "s" : ""} no caben en una sola lámina.
              Se necesitan {result.sheetsNeeded} láminas en total.
            </div>
          )}

          {/* Mapa de corte SVG */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Mapa de corte — {sheet.name}
            </p>
            <div className="overflow-x-auto">
              <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                role="img"
                aria-label={`Mapa de corte para lámina ${sheet.name}`}
                className="rounded border border-border"
                style={{ display: "block", background: "#0e1825" }}
              >
                {/* Fondo de lámina */}
                <rect x={0} y={0} width={svgW} height={svgH} fill="#141e2e" />

                {/* Cuadrícula cada 100mm */}
                {Array.from({ length: Math.floor(sheet.w / 100) }).map((_, i) => (
                  <line
                    key={`vg-${i}`}
                    x1={(i + 1) * 100 * scale} y1={0}
                    x2={(i + 1) * 100 * scale} y2={svgH}
                    stroke="#1a2840" strokeWidth={1}
                  />
                ))}
                {Array.from({ length: Math.floor(sheet.h / 100) }).map((_, i) => (
                  <line
                    key={`hg-${i}`}
                    x1={0} y1={(i + 1) * 100 * scale}
                    x2={svgW} y2={(i + 1) * 100 * scale}
                    stroke="#1a2840" strokeWidth={1}
                  />
                ))}

                {/* Piezas colocadas */}
                {result.placed.map((p, i) => {
                  const px = p.x * scale;
                  const py = p.y * scale;
                  const pw = p.w * scale;
                  const ph = p.h * scale;
                  const color = colorFor(p.originalIndex);
                  return (
                    <g key={i}>
                      <rect
                        x={px} y={py} width={pw} height={ph}
                        fill={color}
                        fillOpacity={0.75}
                        stroke={color}
                        strokeWidth={1.5}
                        rx={2}
                      />
                      {/* Nombre de pieza si hay espacio suficiente */}
                      {pw > 30 && ph > 14 && (
                        <text
                          x={px + pw / 2}
                          y={py + ph / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={Math.min(11, pw / 5, ph / 2)}
                          fill="#ffffff"
                          fontFamily="Inter, sans-serif"
                          fontWeight="500"
                        >
                          {p.rotated ? `↻ ${p.name}` : p.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Borde de lámina */}
                <rect x={0} y={0} width={svgW} height={svgH}
                  fill="none" stroke="#4a9eff" strokeWidth={2} />

                {/* Etiqueta de dimensión */}
                <text x={4} y={svgH - 4} fontSize={9} fill="#4a9eff" fontFamily="Inter, sans-serif">
                  {sheet.w} × {sheet.h} mm
                </text>
              </svg>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3">
            {pieces.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ background: colorFor(i), opacity: 0.85 }}
                />
                {p.name} ×{p.qty}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight, warn }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2.5">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p
        className={`text-lg font-semibold font-mono ${
          highlight ? "text-primary" : warn ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}