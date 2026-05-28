import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Maximize2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const GAP = 3; // mm entre piezas
const PALETTE = [
  "#2a5298", "#1a7a4a", "#7a2a1a", "#6a3a8a", "#1a6a7a",
  "#7a6a1a", "#3a6a2a", "#8a2a5a", "#2a6a5a", "#5a3a1a",
];

function colorFor(idx) {
  return PALETTE[idx % PALETTE.length];
}

export default function InteractiveSheetLayout({ pieces, sheetW = 1000, sheetH = 700 }) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Inicializar piezas en layout al montar o cuando cambian las piezas
  useEffect(() => {
    initializeLayout();
  }, [pieces]);

  const initializeLayout = () => {
    const expanded = [];
    pieces.forEach((p, idx) => {
      for (let i = 0; i < p.qty; i++) {
        expanded.push({
          id: `${idx}-${i}`,
          originalIndex: idx,
          name: p.name,
          w: p.measureA,
          h: p.measureB,
          x: 10 + (idx % 4) * 250,
          y: 10 + Math.floor(idx / 4) * 200,
          rotated: false,
        });
      }
    });
    setLayout(expanded);
  };

  const calculateStats = () => {
    let usedArea = 0;
    layout.forEach((piece) => {
      usedArea += piece.w * piece.h;
    });
    const sheetArea = sheetW * sheetH;
    const efficiency = (usedArea / sheetArea) * 100;
    return { usedArea, sheetArea, efficiency };
  };

  const handleMouseDown = (e, pieceId) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const piece = layout.find((p) => p.id === pieceId);
    if (!piece) return;

    const scale = svg.clientWidth / sheetW;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setDragging(pieceId);
    setDragOffset({
      x: mouseX - piece.x,
      y: mouseY - piece.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scale = svg.clientWidth / sheetW;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const piece = layout.find((p) => p.id === dragging);
    if (!piece) return;

    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;

    // Limitar dentro de los límites de la lámina
    const pw = piece.rotated ? piece.h : piece.w;
    const ph = piece.rotated ? piece.w : piece.h;

    newX = Math.max(0, Math.min(newX, sheetW - pw));
    newY = Math.max(0, Math.min(newY, sheetH - ph));

    setLayout((prev) =>
      prev.map((p) =>
        p.id === dragging ? { ...p, x: newX, y: newY } : p
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const toggleRotate = (pieceId) => {
    setLayout((prev) =>
      prev.map((p) =>
        p.id === pieceId ? { ...p, rotated: !p.rotated } : p
      )
    );
  };

  const resetLayout = () => {
    initializeLayout();
  };

  const stats = calculateStats();
  const SVG_MAX_W = Math.min(800, typeof window !== "undefined" ? window.innerWidth - 40 : 800);
  const scaleX = SVG_MAX_W / sheetW;
  const scaleY = (600 / sheetH) * scaleX;
  const scale = Math.min(scaleX, scaleY);
  const svgW = Math.round(sheetW * scale);
  const svgH = Math.round(sheetH * scale);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabecera colapsable */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Maximize2 className="h-4 w-4 text-primary" />
          Editor de disposición 2D interactivo
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Aprovechamiento"
              value={`${stats.efficiency.toFixed(1)}%`}
              highlight
            />
            <Stat
              label="Área usada"
              value={`${(stats.usedArea / 1e6).toFixed(3)} m²`}
            />
            <Stat
              label="Desperdicio"
              value={`${(((stats.sheetArea - stats.usedArea) / stats.sheetArea) * 100).toFixed(1)}%`}
              warn={stats.efficiency < 60}
            />
          </div>

          {/* Lienzo SVG interactivo */}
          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${sheetW} ${sheetH}`}
              role="img"
              aria-label="Editor interactivo de disposición de piezas"
              className="rounded border border-border mx-auto"
              style={{ background: "#0e1825", cursor: dragging ? "grabbing" : "grab" }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Fondo y cuadrícula */}
              <rect x={0} y={0} width={sheetW} height={sheetH} fill="#141e2e" />
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

              {/* Piezas arrastables */}
              {layout.map((piece) => {
                const pw = piece.rotated ? piece.h : piece.w;
                const ph = piece.rotated ? piece.w : piece.h;
                const color = colorFor(piece.originalIndex);
                const isSelected = dragging === piece.id;

                return (
                  <g key={piece.id} onMouseDown={(e) => handleMouseDown(e, piece.id)}>
                    {/* Rectángulo principal */}
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={pw}
                      height={ph}
                      fill={color}
                      fillOpacity={isSelected ? 0.95 : 0.75}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                      rx={2}
                    />

                    {/* Nombre de pieza */}
                    {pw > 30 && ph > 14 && (
                      <text
                        x={piece.x + pw / 2}
                        y={piece.y + ph / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(12, pw / 6, ph / 3)}
                        fill="#ffffff"
                        fontFamily="Inter, sans-serif"
                        fontWeight="600"
                        pointerEvents="none"
                      >
                        {piece.rotated ? "↻ " : ""}
                        {piece.name}
                      </text>
                    )}

                    {/* Etiqueta de dimensiones */}
                    {pw > 50 && ph > 30 && (
                      <text
                        x={piece.x + pw / 2}
                        y={piece.y + ph - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(255,255,255,0.7)"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {pw.toFixed(0)}×{ph.toFixed(0)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Borde de lámina */}
              <rect
                x={0}
                y={0}
                width={sheetW}
                height={sheetH}
                fill="none"
                stroke="#4a9eff"
                strokeWidth={3}
              />

              {/* Etiqueta */}
              <text x={8} y={sheetH - 8} fontSize={10} fill="#4a9eff" fontFamily="Inter">
                {sheetW} × {sheetH} mm
              </text>
            </svg>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={resetLayout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Restablecer disposición
            </Button>
            <p className="text-xs text-muted-foreground self-center ml-auto">
              Arrastra las piezas con el mouse para optimizar manualmente
            </p>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 text-xs">
            {pieces.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
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