import React from "react";

/**
 * Esquema isométrico simplificado de la caja según su tipo.
 * Usa proyección isométrica a 30°. No depende de medidas exactas —
 * muestra la forma genérica con etiquetas de las partes.
 */
export default function BoxSchemaSVG({ boxType, highlightedPiece }) {
  if (!boxType) return null;
  return (
    <div className="w-full">
      {boxType.id === "estuche" && <EsquemaEstuche highlightedPiece={highlightedPiece} />}
      {boxType.id === "carpeta" && <EsquemaCarpeta highlightedPiece={highlightedPiece} />}
      {boxType.id === "tapa"    && <EsquemaTapa    highlightedPiece={highlightedPiece} />}
    </div>
  );
}

// ─── Colores ────────────────────────────────────────────────────────────────
const C = {
  stroke:  "#4a9eff",
  dim:     "#7db8ff",
  label:   "#c8d8ee",
  accent:  "#60c4ff",
  muted:   "#2a4060",
  hi:      "rgba(74,158,255,0.22)",
  base:    "rgba(255,255,255,0.03)",
};

function isHighlighted(name, highlightedPiece) {
  if (!highlightedPiece) return false;
  return highlightedPiece.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(highlightedPiece.name.toLowerCase());
}

// ─── Estuche ────────────────────────────────────────────────────────────────
function EsquemaEstuche({ highlightedPiece }) {
  const hi = (n) => isHighlighted(n, highlightedPiece);
  // Isométrica simple: caja 3D abierta con tapa separada arriba
  // puntos base: frente, lado derecho, superior
  const W = 320, H = 260;

  // Base del cubo isométrico centrado
  const cx = 160, cy = 145;
  // vectores isométricos
  const dx = [50, 28]; // derecha
  const dy = [-50, 28]; // izquierda-arriba
  const dz = [0, -52];   // arriba

  const p = (ix, iy, iz) => [
    cx + ix * dx[0] + iy * dy[0] + iz * dz[0],
    cy + ix * dx[1] + iy * dy[1] + iz * dz[1],
  ];

  const pts = (...coords) => coords.map(([x, y]) => `${x},${y}`).join(" ");

  // Cara frontal
  const fA = p(0,0,0), fB = p(1,0,0), fC = p(1,0,1), fD = p(0,0,1);
  // Cara derecha
  const rB = p(1,0,0), rE = p(1,1,0), rF = p(1,1,1), rC2 = p(1,0,1);
  // Cara superior (base)
  const tD = p(0,0,1), tC = p(1,0,1), tF2 = p(1,1,1), tG = p(0,1,1);
  // Tapa (desplazada hacia arriba)
  const liftZ = 1.7;
  const ltA = p(0,0,liftZ), ltB = p(1,0,liftZ), ltC = p(1,0,liftZ+0.15), ltD = p(0,0,liftZ+0.15);
  const ltE = p(1,1,liftZ), ltF = p(1,1,liftZ+0.15);
  const ltG = p(0,1,liftZ), ltH = p(0,1,liftZ+0.15);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}
      aria-label="Esquema isométrico: Estuche" role="img">

      {/* Cara frontal */}
      <polygon points={pts(fA, fB, fC, fD)}
        fill={hi("Lateral corto") ? C.hi : C.base} stroke={hi("Lateral corto") ? C.accent : C.muted} strokeWidth="1.5" />

      {/* Cara derecha */}
      <polygon points={pts(rB, rE, rF, rC2)}
        fill={hi("Lateral largo") ? C.hi : C.base} stroke={hi("Lateral largo") ? C.accent : C.muted} strokeWidth="1.5" />

      {/* Cara superior — base */}
      <polygon points={pts(tD, tC, tF2, tG)}
        fill={hi("Base") ? C.hi : "rgba(74,158,255,0.06)"} stroke={hi("Base") ? C.accent : C.dim} strokeWidth="1.5" />

      {/* Tapa separada arriba — frente */}
      <polygon points={pts(ltA, ltB, ltC, ltD)}
        fill={hi("Tapa") ? C.hi : C.base} stroke={hi("Tapa") ? C.accent : C.muted} strokeWidth="1.5" />
      {/* Tapa — derecha */}
      <polygon points={pts(ltB, ltE, ltF, ltC)}
        fill={hi("Tapa") ? C.hi : C.base} stroke={hi("Tapa") ? C.accent : C.muted} strokeWidth="1.5" />
      {/* Tapa — inferior (visible) */}
      <polygon points={pts(ltA, ltB, ltE, ltG)}
        fill={hi("Tapa") ? C.hi : "rgba(74,158,255,0.05)"} stroke={hi("Tapa") ? C.accent : C.dim} strokeWidth="1.5" />

      {/* Líneas internas del borde de la caja */}
      <line x1={fD[0]} y1={fD[1]} x2={tG[0]} y2={tG[1]} stroke={C.muted} strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Etiquetas */}
      <Label x={(fA[0]+fB[0]+fC[0]+fD[0])/4} y={(fA[1]+fB[1]+fC[1]+fD[1])/4} text="Lateral corto" hi={hi("Lateral corto")} />
      <Label x={(rB[0]+rE[0]+rF[0]+rC2[0])/4 + 6} y={(rB[1]+rE[1]+rF[1]+rC2[1])/4} text="Lateral largo" hi={hi("Lateral largo")} />
      <Label x={(tD[0]+tC[0]+tF2[0]+tG[0])/4} y={(tD[1]+tC[1]+tF2[1]+tG[1])/4 - 4} text="Base" hi={hi("Base")} />
      <Label x={(ltA[0]+ltB[0]+ltE[0]+ltG[0])/4} y={(ltA[1]+ltB[1]+ltE[1]+ltG[1])/4 - 6} text="Tapa" hi={hi("Tapa")} />
    </svg>
  );
}

// ─── Carpeta ─────────────────────────────────────────────────────────────────
function EsquemaCarpeta({ highlightedPiece }) {
  const hi = (n) => isHighlighted(n, highlightedPiece);
  const W = 320, H = 220;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}
      aria-label="Esquema: Carpeta" role="img">

      {/* Plano central */}
      <rect x={90} y={60} width={140} height={110}
        fill={hi("Plano central") ? C.hi : C.base}
        stroke={hi("Plano central") ? C.accent : C.dim} strokeWidth="1.5" />

      {/* Solapa izquierda */}
      <rect x={42} y={60} width={48} height={110}
        fill={hi("Solapa") ? C.hi : C.base}
        stroke={hi("Solapa") ? C.accent : C.muted} strokeWidth="1.5" />

      {/* Solapa derecha */}
      <rect x={230} y={60} width={48} height={110}
        fill={hi("Solapa") ? C.hi : C.base}
        stroke={hi("Solapa") ? C.accent : C.muted} strokeWidth="1.5" />

      {/* Líneas de pliegue */}
      <line x1={90} y1={60} x2={90} y2={170} stroke={C.accent} strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
      <line x1={230} y1={60} x2={230} y2={170} stroke={C.accent} strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />

      {/* Etiquetas pliegue */}
      <text x={90} y={52} textAnchor="middle" fontSize="9" fill={C.accent} fontFamily="Inter,sans-serif" opacity="0.8">pliegue</text>
      <text x={230} y={52} textAnchor="middle" fontSize="9" fill={C.accent} fontFamily="Inter,sans-serif" opacity="0.8">pliegue</text>

      <Label x={160} y={115} text="Plano central" hi={hi("Plano central")} />
      <Label x={66} y={115} text="Solapa" hi={hi("Solapa")} small />
      <Label x={254} y={115} text="Solapa" hi={hi("Solapa")} small />

      {/* Flecha que indica plegado */}
      <path d="M66,180 Q66,196 90,196 Q120,196 120,185" fill="none" stroke={C.muted} strokeWidth="1" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill={C.muted} />
        </marker>
      </defs>
      <text x={80} y={210} fontSize="9" fill={C.label} fontFamily="Inter,sans-serif" opacity="0.6">Se pliega hacia adentro</text>
    </svg>
  );
}

// ─── Caja con tapa ──────────────────────────────────────────────────────────
function EsquemaTapa({ highlightedPiece }) {
  const hi = (n) => isHighlighted(n, highlightedPiece);
  const W = 320, H = 280;

  const cx = 160, cy = 175;
  const dx = [48, 27];
  const dy = [-48, 27];
  const dz = [0, -50];

  const p = (ix, iy, iz) => [
    cx + ix * dx[0] + iy * dy[0] + iz * dz[0],
    cy + ix * dx[1] + iy * dy[1] + iz * dz[1],
  ];
  const pts = (...coords) => coords.map(([x, y]) => `${x},${y}`).join(" ");

  // Caja base (media altura)
  const bfA = p(0,0,0), bfB = p(1,0,0), bfC = p(1,0,0.5), bfD = p(0,0,0.5);
  const brB = p(1,0,0), brE = p(1,1,0), brF = p(1,1,0.5), brC2 = p(1,0,0.5);
  const btD = p(0,0,0.5), btC = p(1,0,0.5), btF2 = p(1,1,0.5), btG = p(0,1,0.5);

  // Tapa (separada encima, media altura)
  const lift = 1.1;
  const tfA = p(0,0,lift), tfB = p(1,0,lift), tfC = p(1,0,lift+0.5), tfD = p(0,0,lift+0.5);
  const trE = p(1,1,lift), trF = p(1,1,lift+0.5);
  const ttA = p(0,0,lift+0.5), ttB = p(1,0,lift+0.5), ttF = p(1,1,lift+0.5), ttG = p(0,1,lift+0.5);
  const trB = p(1,0,lift);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}
      aria-label="Esquema isométrico: Caja con tapa" role="img">

      {/* BASE */}
      <polygon points={pts(bfA,bfB,bfC,bfD)}
        fill={hi("Lateral largo (base)") ? C.hi : C.base}
        stroke={hi("Lateral largo (base)") ? C.accent : C.muted} strokeWidth="1.5" />
      <polygon points={pts(brB,brE,brF,brC2)}
        fill={hi("Lateral corto (base)") ? C.hi : C.base}
        stroke={hi("Lateral corto (base)") ? C.accent : C.muted} strokeWidth="1.5" />
      <polygon points={pts(btD,btC,btF2,btG)}
        fill={hi("Base inferior") ? C.hi : "rgba(74,158,255,0.07)"}
        stroke={hi("Base inferior") ? C.accent : C.dim} strokeWidth="1.5" />

      {/* TAPA */}
      <polygon points={pts(tfA,tfB,tfC,tfD)}
        fill={hi("Lateral largo (tapa)") ? C.hi : C.base}
        stroke={hi("Lateral largo (tapa)") ? C.accent : C.muted} strokeWidth="1.5" />
      <polygon points={pts(trB,trE,trF,tfC)}
        fill={hi("Lateral corto (tapa)") ? C.hi : C.base}
        stroke={hi("Lateral corto (tapa)") ? C.accent : C.muted} strokeWidth="1.5" />
      <polygon points={pts(ttA,ttB,ttF,ttG)}
        fill={hi("Tapa superior") ? C.hi : "rgba(74,158,255,0.10)"}
        stroke={hi("Tapa superior") ? C.accent : C.dim} strokeWidth="1.5" />

      {/* Etiquetas */}
      <Label x={(bfA[0]+bfB[0]+bfC[0]+bfD[0])/4} y={(bfA[1]+bfB[1]+bfC[1]+bfD[1])/4} text="L. largo (base)" hi={hi("Lateral largo (base)")} small />
      <Label x={(brB[0]+brE[0]+brF[0]+brC2[0])/4+5} y={(brB[1]+brE[1]+brF[1]+brC2[1])/4} text="L. corto (base)" hi={hi("Lateral corto (base)")} small />
      <Label x={(btD[0]+btC[0]+btF2[0]+btG[0])/4} y={(btD[1]+btC[1]+btF2[1]+btG[1])/4 - 3} text="Base inferior" hi={hi("Base inferior")} small />

      <Label x={(tfA[0]+tfB[0]+tfC[0]+tfD[0])/4} y={(tfA[1]+tfB[1]+tfC[1]+tfD[1])/4} text="L. largo (tapa)" hi={hi("Lateral largo (tapa)")} small />
      <Label x={(trB[0]+trE[0]+trF[0]+tfC[0])/4+5} y={(trB[1]+trE[1]+trF[1]+tfC[1])/4} text="L. corto (tapa)" hi={hi("Lateral corto (tapa)")} small />
      <Label x={(ttA[0]+ttB[0]+ttF[0]+ttG[0])/4} y={(ttA[1]+ttB[1]+ttF[1]+ttG[1])/4 - 4} text="Tapa superior" hi={hi("Tapa superior")} small />
    </svg>
  );
}

// ─── Helper de etiqueta ──────────────────────────────────────────────────────
function Label({ x, y, text, hi, small }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle" dominantBaseline="middle"
      fontSize={small ? "9" : "10.5"}
      fill={hi ? C.accent : C.label}
      fontFamily="Inter, sans-serif"
      fontWeight={hi ? "700" : "500"}
      opacity={hi ? "1" : "0.75"}
    >
      {text}
    </text>
  );
}