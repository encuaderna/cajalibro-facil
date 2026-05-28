import React from "react";

/**
 * Dibuja una pieza rectangular con cotas técnicas en SVG.
 * measureA = dimensión horizontal, measureB = dimensión vertical (en mm)
 */
export default function PieceDiagram({ piece, highlighted = false }) {
  const PAD = 52;          // margen para cotas
  const SVG_W = 340;
  const SVG_H = 240;
  const INNER_W = SVG_W - PAD * 2;
  const INNER_H = SVG_H - PAD * 2;

  const { measureA, measureB, name } = piece;
  const ratio = measureA > 0 && measureB > 0 ? measureA / measureB : 1;

  // Escalar para que quepa en el área interior manteniendo proporción
  let rectW, rectH;
  if (ratio >= INNER_W / INNER_H) {
    rectW = INNER_W;
    rectH = INNER_W / ratio;
  } else {
    rectH = INNER_H;
    rectW = INNER_H * ratio;
  }

  // Centrar en el área interior
  const x0 = PAD + (INNER_W - rectW) / 2;
  const y0 = PAD + (INNER_H - rectH) / 2;
  const x1 = x0 + rectW;
  const y1 = y0 + rectH;

  const TICK = 5;
  const OFFSET_H = 22; // distancia cota horizontal debajo
  const OFFSET_V = 22; // distancia cota vertical izquierda

  // Cota horizontal (abajo)
  const cotaHy = y1 + OFFSET_H;
  // Cota vertical (izquierda)
  const cotaVx = x0 - OFFSET_V;

  const labelA = `${measureA} mm`;
  const labelB = `${measureB} mm`;

  const stroke = "#4a9eff";
  const dimColor = "#7db8ff";
  const textColor = "#c8d8ee";
  const fillColor = highlighted ? "rgba(74,158,255,0.08)" : "rgba(255,255,255,0.03)";
  const borderColor = highlighted ? "#4a9eff" : "#3a5070";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: "block" }}
      aria-label={`Diagrama de pieza: ${name}, ${labelA} × ${labelB}`}
      role="img"
    >
      {/* Fondo de la pieza */}
      <rect
        x={x0} y={y0} width={rectW} height={rectH}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="1.5"
        strokeDasharray={highlighted ? "none" : "4 3"}
      />

      {/* Hatch pattern sutil */}
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={highlighted ? "rgba(74,158,255,0.12)" : "rgba(255,255,255,0.04)"} strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={x0} y={y0} width={rectW} height={rectH} fill="url(#hatch)" />

      {/* Esquinas técnicas (cruces en las esquinas) */}
      {[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([cx, cy], i) => (
        <g key={i}>
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={dimColor} strokeWidth="0.8" opacity="0.6" />
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke={dimColor} strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}

      {/* ── Cota horizontal (ancho) ── */}
      {/* líneas de extensión */}
      <line x1={x0} y1={y1 + 4} x2={x0} y2={cotaHy + TICK} stroke={dimColor} strokeWidth="0.8" opacity="0.7" />
      <line x1={x1} y1={y1 + 4} x2={x1} y2={cotaHy + TICK} stroke={dimColor} strokeWidth="0.8" opacity="0.7" />
      {/* línea de cota */}
      <line x1={x0} y1={cotaHy} x2={x1} y2={cotaHy} stroke={dimColor} strokeWidth="1.2" />
      {/* flechas */}
      <polygon points={`${x0},${cotaHy} ${x0 + 7},${cotaHy - 3} ${x0 + 7},${cotaHy + 3}`} fill={dimColor} />
      <polygon points={`${x1},${cotaHy} ${x1 - 7},${cotaHy - 3} ${x1 - 7},${cotaHy + 3}`} fill={dimColor} />
      {/* texto */}
      <text
        x={(x0 + x1) / 2} y={cotaHy - 5}
        textAnchor="middle" fontSize="11" fill={textColor}
        fontFamily="Inter, monospace" fontWeight="500"
      >
        {labelA}
      </text>

      {/* ── Cota vertical (alto) ── */}
      {/* líneas de extensión */}
      <line x1={x0 - 4} y1={y0} x2={cotaVx - TICK} y2={y0} stroke={dimColor} strokeWidth="0.8" opacity="0.7" />
      <line x1={x0 - 4} y1={y1} x2={cotaVx - TICK} y2={y1} stroke={dimColor} strokeWidth="0.8" opacity="0.7" />
      {/* línea de cota */}
      <line x1={cotaVx} y1={y0} x2={cotaVx} y2={y1} stroke={dimColor} strokeWidth="1.2" />
      {/* flechas */}
      <polygon points={`${cotaVx},${y0} ${cotaVx - 3},${y0 + 7} ${cotaVx + 3},${y0 + 7}`} fill={dimColor} />
      <polygon points={`${cotaVx},${y1} ${cotaVx - 3},${y1 - 7} ${cotaVx + 3},${y1 - 7}`} fill={dimColor} />
      {/* texto rotado */}
      <text
        x={cotaVx + 5} y={(y0 + y1) / 2}
        textAnchor="middle" fontSize="11" fill={textColor}
        fontFamily="Inter, monospace" fontWeight="500"
        transform={`rotate(-90, ${cotaVx + 5}, ${(y0 + y1) / 2})`}
      >
        {labelB}
      </text>

      {/* Nombre de la pieza centrado */}
      <text
        x={(x0 + x1) / 2} y={(y0 + y1) / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="12" fill={stroke} fontFamily="Inter, sans-serif"
        fontWeight="600" opacity="0.7"
      >
        {name}
      </text>
    </svg>
  );
}