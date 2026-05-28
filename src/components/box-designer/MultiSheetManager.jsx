import React, { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import { optimizeSheet } from "@/lib/sheetOptimizer";

const PALETTE = [
  "#2a5298", "#1a7a4a", "#7a2a1a", "#6a3a8a", "#1a6a7a",
  "#7a6a1a", "#3a6a2a", "#8a2a5a", "#2a6a5a", "#5a3a1a",
];

function colorFor(idx) {
  return PALETTE[idx % PALETTE.length];
}

export default function MultiSheetManager({ pieces, sheetW = 1000, sheetH = 700, onSheetsChange }) {
  const [open, setOpen] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(0);

  // Calcular distribución en múltiples láminas
  const sheets = useMemo(() => {
    if (!pieces || pieces.length === 0) return [];

    const sheet = { w: sheetW, h: sheetH };
    const result = optimizeSheet(pieces, sheet);
    
    // Si todas caben en una lámina
    if (result.sheetsNeeded === 1) {
      return [{
        id: 0,
        pieces: result.placed.map((p, i) => ({
          ...p,
          id: `placed-${i}`,
          width: p.w,
          height: p.h,
        })),
        usedArea: result.usedArea,
        efficiency: result.efficiency,
      }];
    }

    // Si no caben todas, distribuir en múltiples láminas
    const sheetList = [];
    const processedPieces = new Set();
    
    for (let sheetIdx = 0; sheetIdx < result.sheetsNeeded; sheetIdx++) {
      const remaining = pieces
        .map((p, idx) => ({ ...p, originalIndex: idx, qty: p.qty }))
        .filter((p, idx) => !processedPieces.has(idx));

      if (remaining.length === 0) break;

      const sheetResult = optimizeSheet(remaining, sheet);
      if (sheetResult.placed.length === 0) break;

      sheetList.push({
        id: sheetIdx,
        pieces: sheetResult.placed.map((p, i) => ({
          ...p,
          id: `sheet-${sheetIdx}-${i}`,
          width: p.w,
          height: p.h,
        })),
        usedArea: sheetResult.usedArea,
        efficiency: sheetResult.efficiency,
      });

      sheetResult.placed.forEach(p => {
        const origIdx = remaining.findIndex(rp => rp.name === p.name);
        if (origIdx >= 0) processedPieces.add(origIdx);
      });
    }

    const finalSheets = sheetList.length > 0 ? sheetList : [{
      id: 0,
      pieces: result.placed.map((p, i) => ({
        ...p,
        id: `placed-${i}`,
        width: p.w,
        height: p.h,
      })),
      usedArea: result.usedArea,
      efficiency: result.efficiency,
    }];

    // Notificar al padre sobre las láminas generadas
    onSheetsChange?.(finalSheets);
    return finalSheets;
  }, [pieces, sheetW, sheetH, onSheetsChange]);

  const totalSheets = sheets.length;
  const totalArea = sheets.reduce((sum, s) => sum + s.usedArea, 0);
  const avgEfficiency = totalSheets > 0
    ? sheets.reduce((sum, s) => sum + s.efficiency, 0) / totalSheets
    : 0;

  if (!open) {
    return (
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors rounded-lg border bg-card"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          Distribución en {totalSheets} lámina{totalSheets !== 1 ? "s" : ""}
        </span>
        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
          {totalSheets}×
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabecera */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen(false)}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          Distribución en múltiples láminas
        </span>
        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
          {totalSheets} lámina{totalSheets !== 1 ? "s" : ""}
        </span>
      </button>

      <div className="p-4 space-y-4">
        {/* Estadísticas globales */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total de láminas" value={totalSheets} highlight />
          <StatCard
            label="Área total usada"
            value={`${(totalArea / 1e6).toFixed(3)} m²`}
          />
          <StatCard
            label="Eficiencia promedio"
            value={`${avgEfficiency.toFixed(1)}%`}
          />
        </div>

        {/* Selector de láminas */}
        {totalSheets > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sheets.map((sheet, idx) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedSheet(idx)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSheet === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Lámina {idx + 1}
                <span className="text-xs ml-1.5 opacity-75">
                  {sheet.pieces.length} pzas
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Visualización de lámina seleccionada */}
        {sheets.length > 0 && (
          <SheetPreview
            sheet={sheets[selectedSheet]}
            sheetW={sheetW}
            sheetH={sheetH}
            pieces={pieces}
          />
        )}

        {/* Tabla de distribución */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Desglose por lámina
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                    Lámina
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    Piezas
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    Área usada
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    Eficiencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((sheet, idx) => (
                  <tr
                    key={sheet.id}
                    className={`border-b border-border/50 ${
                      selectedSheet === idx ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-2 px-3 text-foreground font-medium">#{idx + 1}</td>
                    <td className="py-2 px-3 text-center text-foreground">
                      {sheet.pieces.length}
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">
                      {(sheet.usedArea / 1e6).toFixed(4)} m²
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`font-mono font-medium ${
                          sheet.efficiency >= 80
                            ? "text-green-600"
                            : sheet.efficiency >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {sheet.efficiency.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetPreview({ sheet, sheetW, sheetH, pieces }) {
  const SVG_MAX_W = Math.min(600, typeof window !== "undefined" ? window.innerWidth - 80 : 600);
  const scaleX = SVG_MAX_W / sheetW;
  const scaleY = (400 / sheetH) * scaleX;
  const scale = Math.min(scaleX, scaleY);
  const svgW = Math.round(sheetW * scale);
  const svgH = Math.round(sheetH * scale);

  return (
    <div className="border border-border rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-2">
        Eficiencia: {sheet.efficiency.toFixed(1)}% · {sheet.pieces.length} piezas
      </p>
      <div className="overflow-x-auto flex justify-center">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${sheetW} ${sheetH}`}
          className="rounded border border-border/50"
          style={{ background: "#0e1825" }}
        >
          {/* Fondo */}
          <rect x={0} y={0} width={sheetW} height={sheetH} fill="#141e2e" />

          {/* Grid */}
          {Array.from({ length: Math.floor(sheetW / 100) }).map((_, i) => (
            <line
              key={`vg-${i}`}
              x1={(i + 1) * 100}
              y1={0}
              x2={(i + 1) * 100}
              y2={sheetH}
              stroke="#1a2840"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.floor(sheetH / 100) }).map((_, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={(i + 1) * 100}
              x2={sheetW}
              y2={(i + 1) * 100}
              stroke="#1a2840"
              strokeWidth={1}
            />
          ))}

          {/* Piezas */}
          {sheet.pieces.map((piece) => {
            const colorIdx = piece.originalIndex || 0;
            const color = colorFor(colorIdx);

            return (
              <g key={piece.id}>
                <rect
                  x={piece.x || 0}
                  y={piece.y || 0}
                  width={piece.width}
                  height={piece.height}
                  fill={color}
                  fillOpacity={0.75}
                  stroke={color}
                  strokeWidth={2}
                  rx={2}
                />
                {piece.width > 30 && piece.height > 12 && (
                  <text
                    x={(piece.x || 0) + piece.width / 2}
                    y={(piece.y || 0) + piece.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#ffffff"
                    fontFamily="Inter"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {piece.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Border */}
          <rect
            x={0}
            y={0}
            width={sheetW}
            height={sheetH}
            fill="none"
            stroke="#4a9eff"
            strokeWidth={3}
          />
          <text x={8} y={sheetH - 8} fontSize={10} fill="#4a9eff" fontFamily="Inter">
            {sheetW} × {sheetH} mm
          </text>
        </svg>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p
        className={`text-base font-semibold font-mono ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}