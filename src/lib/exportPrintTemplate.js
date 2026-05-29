import jsPDF from "jspdf";

// A0 = 841 × 1189 mm, A1 = 594 × 841 mm, A2 = 420 × 594 mm
// A3 = 297 × 420 mm, A4 = 210 × 297 mm
const PAGE_SIZES = {
  A4: [210, 297],
  A3: [297, 420],
  A2: [420, 594],
  A1: [594, 841],
};

const MARGIN = 10; // mm de margen en el documento
const PIECE_GAP = 6; // mm entre piezas

/**
 * Exporta una plantilla PDF a escala real (1:1) con todas las piezas.
 * Si alguna pieza no cabe en el formato, se pagina automáticamente.
 * @param {Array} pieces - Array de objetos { name, measureA, measureB, qty }
 * @param {string} pageFormat - "A4" | "A3" | "A2" | "A1"
 * @param {{ alto, ancho, profundidad }} dimensions
 * @param {{ name, id }} boxType
 * @param {{ name, thickness }} material
 */
export function exportPrintTemplate(pieces, pageFormat = "A4", dimensions, boxType, material) {
  const [pageW, pageH] = PAGE_SIZES[pageFormat] || PAGE_SIZES.A4;
  const usableW = pageW - MARGIN * 2;
  const usableH = pageH - MARGIN * 2;

  const doc = new jsPDF({
    unit: "mm",
    format: pageFormat.toLowerCase(),
    orientation: pageW > pageH ? "landscape" : "portrait",
  });

  // ── Portada / cabecera en la primera página ──────────────────────────────
  let curX = MARGIN;
  let curY = MARGIN;

  const drawHeader = () => {
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("PLANTILLA A ESCALA REAL — Caja para Libro", MARGIN, curY);
    curY += 6;

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100);
    doc.text(
      `Libro: ${dimensions.alto} × ${dimensions.ancho} × ${dimensions.profundidad} mm   ·   Tipo: ${boxType.name}   ·   Material: ${material.name} (${material.thickness} mm)`,
      MARGIN,
      curY
    );
    curY += 4;

    doc.text(
      `Formato: ${pageFormat}   ·   Escala: 1:1 (imprime a tamaño real, sin ajuste de página)`,
      MARGIN,
      curY
    );
    curY += 5;

    // Línea separadora
    doc.setDrawColor(160);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, curY, pageW - MARGIN, curY);
    curY += 5;
    doc.setTextColor(0);
  };

  drawHeader();

  // ── Dibujar cada pieza ──────────────────────────────────────────────────
  // Recorrer piezas; cada pieza se repite según qty, dibujada a escala real
  const CORNER_SIZE = 3; // tamaño de la marca de esquina en mm
  const LABEL_H = 8; // altura reservada para el texto encima de la pieza

  const drawPiece = (piece, copyIdx) => {
    const pw = piece.measureA; // ancho real de la pieza en mm
    const ph = piece.measureB; // alto real de la pieza en mm

    // ¿Cabe en la zona usable horizontalmente? Intentar orientar si no cabe
    let drawW = pw;
    let drawH = ph;
    if (pw > usableW && ph <= usableW) {
      // Rotar 90°
      drawW = ph;
      drawH = pw;
    }

    // Si la pieza supera la página en ambas dimensiones, escalar (nota al usuario)
    const scaleOverride = drawW > usableW || drawH > usableH - LABEL_H;
    let finalW = drawW;
    let finalH = drawH;
    let scaleFactor = 1;
    if (scaleOverride) {
      const sx = usableW / drawW;
      const sy = (usableH - LABEL_H) / drawH;
      scaleFactor = Math.min(sx, sy);
      finalW = drawW * scaleFactor;
      finalH = drawH * scaleFactor;
    }

    // ¿Cabe en la fila actual? Si no, saltar a nueva fila
    if (curX + finalW > pageW - MARGIN) {
      curX = MARGIN;
      curY += PIECE_GAP + (curY > MARGIN ? 0 : 0); // ya se actualizó arriba
    }

    // ¿Cabe en la página? Si no, nueva página
    if (curY + LABEL_H + finalH > pageH - MARGIN) {
      doc.addPage();
      curX = MARGIN;
      curY = MARGIN;
    }

    // Etiqueta superior de la pieza
    doc.setFontSize(7.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30);
    const label = piece.qty > 1
      ? `${piece.name}  (${copyIdx + 1}/${piece.qty})  ${pw.toFixed(1)} × ${ph.toFixed(1)} mm`
      : `${piece.name}  ${pw.toFixed(1)} × ${ph.toFixed(1)} mm`;
    doc.text(label, curX, curY + 4.5);
    if (scaleOverride && scaleFactor < 1) {
      doc.setFontSize(6);
      doc.setFont(undefined, "italic");
      doc.setTextColor(180, 50, 50);
      doc.text(`* Reducida al ${Math.round(scaleFactor * 100)}% — no cabe en ${pageFormat}`, curX, curY + 8);
    }

    const pieceTop = curY + LABEL_H;

    // Rectángulo principal (contorno de corte)
    doc.setDrawColor(20);
    doc.setLineWidth(0.5);
    doc.setFillColor(245, 248, 255);
    doc.rect(curX, pieceTop, finalW, finalH, "FD");

    // Marcas de esquina (cruces de registro)
    doc.setDrawColor(60);
    doc.setLineWidth(0.25);
    const corners = [
      [curX, pieceTop],
      [curX + finalW, pieceTop],
      [curX, pieceTop + finalH],
      [curX + finalW, pieceTop + finalH],
    ];
    corners.forEach(([cx, cy]) => {
      doc.line(cx - CORNER_SIZE, cy, cx + CORNER_SIZE, cy);
      doc.line(cx, cy - CORNER_SIZE, cx, cy + CORNER_SIZE);
    });

    // Línea central horizontal (referencia de doblado si aplica)
    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(curX, pieceTop + finalH / 2, curX + finalW, pieceTop + finalH / 2);
    doc.setLineDashPattern([], 0);

    // Dimensiones acotadas dentro de la pieza
    doc.setFontSize(6.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80);
    // Ancho en la parte inferior de la pieza
    doc.text(`${pw.toFixed(1)} mm`, curX + finalW / 2, pieceTop + finalH - 2, { align: "center" });
    // Alto en el lateral derecho (rotado)
    doc.saveGraphicsState();
    doc.translate(curX + finalW - 2, pieceTop + finalH / 2);
    doc.rotate(-90);
    doc.text(`${ph.toFixed(1)} mm`, 0, 0, { align: "center" });
    doc.restoreGraphicsState();

    doc.setTextColor(0);

    // Avanzar posición
    curX += finalW + PIECE_GAP;
    // Si la siguiente pieza no cabe en la fila, bajar (altura acumulada)
    // Lo manejamos al inicio del próximo drawPiece
    // Actualizar curY si es la fila más alta
    const rowBottom = pieceTop + finalH;
    if (rowBottom > curY) {
      // guardar máximo en variable externa
      return rowBottom;
    }
    return curY;
  };

  // Rastrear el fondo más bajo de la fila actual
  let rowMaxBottom = curY;

  pieces.forEach((piece) => {
    for (let c = 0; c < piece.qty; c++) {
      // Si curX ya no es el inicio, puede que tengamos que bajar
      if (curX > MARGIN && curX + piece.measureA > pageW - MARGIN) {
        // Nueva fila
        curY = rowMaxBottom + PIECE_GAP;
        curX = MARGIN;
      }
      const bottom = drawPiece(piece, c);
      if (bottom > rowMaxBottom) rowMaxBottom = bottom;
    }
  });

  // ── Leyenda final ──────────────────────────────────────────────────────
  curY = rowMaxBottom + 10;
  if (curY + 20 > pageH - MARGIN) {
    doc.addPage();
    curY = MARGIN + 5;
  }

  doc.setDrawColor(160);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, curY, pageW - MARGIN, curY);
  curY += 5;

  doc.setFontSize(7);
  doc.setFont(undefined, "bold");
  doc.text("INSTRUCCIONES DE IMPRESIÓN:", MARGIN, curY);
  curY += 4.5;
  doc.setFont(undefined, "normal");
  doc.setFontSize(6.5);
  const instructions = [
    "1. Imprimir a tamaño real (100%) sin ajuste de escala — desactivar «Ajustar al área de impresión» o «Ajustar a página».",
    "2. Verificar la escala colocando una regla sobre el rectángulo de una pieza y comparando con las medidas indicadas.",
    "3. Recortar por la línea continua exterior. Las marcas de cruz en las esquinas son guías de registro.",
    "4. La línea discontinua central es una guía de referencia (no de corte).",
    "5. Unir páginas con celo si la pieza se extiende en varios folios.",
  ];
  instructions.forEach((line) => {
    if (curY + 5 > pageH - MARGIN) return;
    doc.text(line, MARGIN, curY);
    curY += 4.5;
  });

  doc.save(`plantilla-escala-real-${boxType.id}-${pageFormat}-${Date.now()}.pdf`);
}