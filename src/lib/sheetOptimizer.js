/**
 * Optimizador de corte en lámina — algoritmo Guillotine / First-Fit Decreasing
 *
 * Expande cada pieza según su cantidad (qty), ordena de mayor a menor área
 * y las va ubicando usando un árbol de rectángulos libres (guillotine cut).
 * Devuelve la posición (x, y, w, h, rotated) de cada pieza colocada y
 * estadísticas de aprovechamiento.
 */

const GAP = 3; // mm entre piezas (margen de sierra)

// Láminas estándar disponibles (en mm)
export const SHEET_SIZES = [
  { id: "100x70",  name: "100 × 70 cm",  w: 1000, h: 700 },
  { id: "120x80",  name: "120 × 80 cm",  w: 1200, h: 800 },
  { id: "50x70",   name: "50 × 70 cm",   w: 500,  h: 700 },
  { id: "a0",      name: "A0 (841×1189 mm)", w: 841, h: 1189 },
];

/**
 * Expande las piezas según qty y añade la orientación alternativa (rotada).
 * Devuelve un array plano: [{ name, w, h, originalIndex, rotated }]
 */
function expandPieces(pieces) {
  const expanded = [];
  pieces.forEach((p, idx) => {
    for (let i = 0; i < p.qty; i++) {
      expanded.push({ name: p.name, w: p.measureA, h: p.measureB, originalIndex: idx, rotated: false });
    }
  });
  // Ordenar de mayor a menor área (heurística FFD)
  expanded.sort((a, b) => b.w * b.h - a.w * a.h);
  return expanded;
}

/**
 * Algoritmo Guillotine: intenta insertar un rectángulo en los espacios libres.
 * Cada nodo libre es { x, y, w, h }.
 * Al insertar se parte el espacio libre en dos con el corte más largo.
 */
function guillotinePack(sheetW, sheetH, pieces) {
  const freeRects = [{ x: 0, y: 0, w: sheetW, h: sheetH }];
  const placed = [];

  for (const piece of pieces) {
    let bestFit = null;
    let bestRect = null;
    let bestRotated = false;

    for (const rect of freeRects) {
      // Sin rotación
      if (piece.w + GAP <= rect.w && piece.h + GAP <= rect.h) {
        const waste = rect.w * rect.h - piece.w * piece.h;
        if (bestFit === null || waste < bestFit) {
          bestFit = waste;
          bestRect = rect;
          bestRotated = false;
        }
      }
      // Con rotación 90°
      if (piece.h + GAP <= rect.w && piece.w + GAP <= rect.h) {
        const waste = rect.w * rect.h - piece.h * piece.w;
        if (bestFit === null || waste < bestFit) {
          bestFit = waste;
          bestRect = rect;
          bestRotated = true;
        }
      }
    }

    if (!bestRect) continue; // no cabe en la lámina

    const pw = bestRotated ? piece.h : piece.w;
    const ph = bestRotated ? piece.w : piece.h;

    placed.push({
      name: piece.name,
      originalIndex: piece.originalIndex,
      x: bestRect.x,
      y: bestRect.y,
      w: pw,
      h: ph,
      rotated: bestRotated,
    });

    // Partir el rectángulo libre en dos (corte guillotina — el lado más largo)
    const rightW = bestRect.w - pw - GAP;
    const topH   = bestRect.h - ph - GAP;

    const splitHoriz = rightW * bestRect.h >= topH * bestRect.w; // elegir corte que maximiza el área restante

    // Eliminar el rect usado
    const idx = freeRects.indexOf(bestRect);
    freeRects.splice(idx, 1);

    if (splitHoriz) {
      // Derecha
      if (rightW > 0 && bestRect.h > 0)
        freeRects.push({ x: bestRect.x + pw + GAP, y: bestRect.y, w: rightW, h: bestRect.h });
      // Arriba
      if (bestRect.w > 0 && topH > 0)
        freeRects.push({ x: bestRect.x, y: bestRect.y + ph + GAP, w: pw + GAP, h: topH });
    } else {
      // Arriba
      if (bestRect.w > 0 && topH > 0)
        freeRects.push({ x: bestRect.x, y: bestRect.y + ph + GAP, w: bestRect.w, h: topH });
      // Derecha
      if (rightW > 0 && ph > 0)
        freeRects.push({ x: bestRect.x + pw + GAP, y: bestRect.y, w: rightW, h: ph + GAP });
    }
  }

  return placed;
}

/**
 * Punto de entrada principal.
 * @param {Array}  pieces    - array de piezas con { name, measureA, measureB, qty }
 * @param {Object} sheet     - { w, h } en mm
 * @returns {{ placed, unplaced, usedArea, sheetArea, efficiency, sheetsNeeded }}
 */
export function optimizeSheet(pieces, sheet) {
  const expanded = expandPieces(pieces);
  const totalPieces = expanded.length;

  const placed = guillotinePack(sheet.w, sheet.h, expanded);
  const unplacedCount = totalPieces - placed.length;

  const usedArea = placed.reduce((sum, p) => sum + p.w * p.h, 0);
  const sheetArea = sheet.w * sheet.h;
  const efficiency = (usedArea / sheetArea) * 100;

  // Si hay piezas sin colocar, estimar cuántas láminas adicionales harían falta
  let sheetsNeeded = 1;
  if (unplacedCount > 0) {
    const remaining = expanded.slice(placed.length);
    let extra = 0;
    let leftover = remaining;
    while (leftover.length > 0) {
      extra++;
      const p2 = guillotinePack(sheet.w, sheet.h, leftover);
      leftover = leftover.slice(p2.length);
      if (p2.length === 0) break; // pieza demasiado grande — no puede colocarse
    }
    sheetsNeeded += extra;
  }

  return { placed, unplacedCount, usedArea, sheetArea, efficiency, sheetsNeeded };
}