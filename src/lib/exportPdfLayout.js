import jsPDF from "jspdf";

const PALETTE = [
  "#2a5298", "#1a7a4a", "#7a2a1a", "#6a3a8a", "#1a6a7a",
  "#7a6a1a", "#3a6a2a", "#8a2a5a", "#2a6a5a", "#5a3a1a",
];

function colorFor(idx) {
  return PALETTE[idx % PALETTE.length];
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

export function exportLayoutPdf(sheets, pieces, sheetW, sheetH) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;

  // Escala de visualización (mm a mm en PDF)
  const scale = Math.min(
    (contentWidth - 10) / sheetW,
    (pageHeight - 80) / sheetH
  );

  let currentY = margin;

  // Título general
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Disposición de Piezas — Layout Técnico", margin, currentY);
  currentY += 10;

  // Información general
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  const infoText = `Total de láminas: ${sheets.length} | Tamaño de lámina: ${sheetW}×${sheetH}mm`;
  doc.text(infoText, margin, currentY);
  currentY += 6;

  // Línea separadora
  doc.setDrawColor(100);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // Iterar por cada lámina
  sheets.forEach((sheet, sheetIdx) => {
    // Verificar si necesita nueva página
    if (currentY + sheetH * scale + 40 > pageHeight) {
      doc.addPage();
      currentY = margin;
    }

    // Título de lámina
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Lámina ${sheetIdx + 1}`, margin, currentY);
    currentY += 6;

    // Estadísticas de lámina
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const statsText = `Eficiencia: ${sheet.efficiency.toFixed(1)}% | Piezas: ${sheet.pieces.length} | Área usada: ${(sheet.usedArea / 1e6).toFixed(4)}m²`;
    doc.text(statsText, margin, currentY);
    currentY += 5;

    // Dibujar lámina en PDF
    const svgX = margin;
    const svgY = currentY;
    const svgW = sheetW * scale;
    const svgH = sheetH * scale;

    // Fondo blanco de lámina
    doc.setFillColor(255, 255, 255);
    doc.rect(svgX, svgY, svgW, svgH, "F");

    // Border de lámina
    doc.setDrawColor(74, 158, 255);
    doc.setLineWidth(0.5);
    doc.rect(svgX, svgY, svgW, svgH);

    // Grid de referencia (líneas cada 100mm)
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    for (let i = 1; i < Math.floor(sheetW / 100); i++) {
      const x = svgX + (i * 100 * scale);
      doc.line(x, svgY, x, svgY + svgH);
    }
    for (let i = 1; i < Math.floor(sheetH / 100); i++) {
      const y = svgY + (i * 100 * scale);
      doc.line(svgX, y, svgX + svgW, y);
    }

    // Dibujar piezas
    sheet.pieces.forEach((piece) => {
      const colorIdx = piece.originalIndex || 0;
      const [r, g, b] = hexToRgb(colorFor(colorIdx));

      // Rectángulo de pieza
      doc.setFillColor(r, g, b);
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);

      const pX = svgX + (piece.x || 0) * scale;
      const pY = svgY + (piece.y || 0) * scale;
      const pW = piece.width * scale;
      const pH = piece.height * scale;

      doc.rect(pX, pY, pW, pH, "FD");

      // Nombre de pieza
      if (pW > 8 && pH > 5) {
        doc.setFontSize(7);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);

        const nameText = piece.name;
        const dimText = `${piece.width.toFixed(0)}×${piece.height.toFixed(0)}mm`;

        // Centrar texto
        const nameX = pX + pW / 2;
        const nameY = pY + pH / 2 - 1;
        doc.text(nameText, nameX, nameY, { align: "center" });

        doc.setFontSize(5);
        doc.setFont(undefined, "normal");
        doc.text(dimText, nameX, nameY + 2, { align: "center" });
      }

      // Reset color de texto
      doc.setTextColor(0, 0, 0);
    });

    // Etiqueta de tamaño de lámina
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(`${sheetW} × ${sheetH} mm`, svgX + 2, svgY + svgH - 2);

    currentY = svgY + svgH + 6;

    // Tabla de piezas en esta lámina
    currentY += 2;
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text("Piezas en esta lámina:", margin, currentY);
    currentY += 4;

    doc.setFontSize(7);
    doc.setFont(undefined, "normal");

    const pieceRows = sheet.pieces.map((p) => [
      p.name,
      `${p.width.toFixed(1)}`,
      `${p.height.toFixed(1)}`,
      `${(p.width * p.height / 1e6).toFixed(4)}`,
    ]);

    // Dibujar tabla simple
    const colWidths = [45, 25, 25, 30];
    const rowHeight = 4;
    let tableY = currentY;

    // Headers
    doc.setFont(undefined, "bold");
    doc.text("Nombre", margin, tableY);
    doc.text("Ancho (mm)", margin + colWidths[0], tableY);
    doc.text("Alto (mm)", margin + colWidths[0] + colWidths[1], tableY);
    doc.text("Área (m²)", margin + colWidths[0] + colWidths[1] + colWidths[2], tableY);
    tableY += rowHeight + 1;

    // Rows
    doc.setFont(undefined, "normal");
    pieceRows.forEach((row) => {
      if (tableY + rowHeight > pageHeight - margin) {
        doc.addPage();
        tableY = margin;
      }
      doc.text(row[0], margin, tableY);
      doc.text(row[1], margin + colWidths[0], tableY);
      doc.text(row[2], margin + colWidths[0] + colWidths[1], tableY);
      doc.text(row[3], margin + colWidths[0] + colWidths[1] + colWidths[2], tableY);
      tableY += rowHeight;
    });

    currentY = tableY + 6;
  });

  // Última página: resumen general
  if (currentY + 40 > pageHeight) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Resumen General", margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const summaryLines = [
    `Total de láminas: ${sheets.length}`,
    `Área total de material usado: ${(sheets.reduce((sum, s) => sum + s.usedArea, 0) / 1e6).toFixed(4)}m²`,
    `Eficiencia promedio: ${(sheets.reduce((sum, s) => sum + s.efficiency, 0) / sheets.length).toFixed(1)}%`,
    `Total de piezas: ${pieces.reduce((sum, p) => sum + p.qty, 0)}`,
  ];

  summaryLines.forEach((line) => {
    doc.text(line, margin, currentY);
    currentY += 6;
  });

  // Leyenda de colores
  currentY += 4;
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Leyenda de colores:", margin, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  pieces.forEach((piece, idx) => {
    const [r, g, b] = hexToRgb(colorFor(idx));
    doc.setFillColor(r, g, b);
    doc.rect(margin + 2, currentY - 2, 4, 4, "F");
    doc.text(`${piece.name}`, margin + 8, currentY);
    currentY += 5;
  });

  // Guardar PDF
  doc.save(`disposicion-piezas-${Date.now()}.pdf`);
}