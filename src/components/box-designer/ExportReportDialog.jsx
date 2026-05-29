import React, { useState } from "react";
import jsPDF from "jspdf";
import { FileText, FileSpreadsheet, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── CSV ──────────────────────────────────────────────────────────────────────
function exportCSV({ pieces, dimensions, boxType, material }) {
  const header = [
    "Pieza",
    "Descripción",
    "Cantidad",
    "Ancho (mm)",
    "Alto (mm)",
    "Área unitaria (mm²)",
    "Área total (mm²)",
    "Medida Final",
  ];

  const rows = pieces.map((p) => {
    const areaUnit = p.measureA * p.measureB;
    const areaTotal = areaUnit * p.qty;
    return [
      p.name,
      `"${p.description}"`,
      p.qty,
      p.measureA,
      p.measureB,
      areaUnit,
      areaTotal,
      `"${p.finalMeasure}"`,
    ];
  });

  const meta = [
    [`# Reporte de Piezas — Caja para Libro`],
    [`# Libro: ${dimensions.alto} × ${dimensions.ancho} × ${dimensions.profundidad} mm`],
    [`# Tipo: ${boxType.name}`],
    [`# Material: ${material.name} (${material.thickness} mm)`],
    [`# Generado: ${new Date().toLocaleString()}`],
    [],
  ];

  const csvContent =
    meta.map((r) => r.join(",")).join("\n") +
    [header, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `piezas-caja-${boxType.id}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── PDF PROVEEDOR ────────────────────────────────────────────────────────────
function exportProviderPDF({ pieces, dimensions, boxType, material, needsAngleCut }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 15;
  let y = MARGIN;

  // ── Cabecera ──
  doc.setFillColor(30, 60, 120);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont(undefined, "bold");
  doc.text("LISTA DE PIEZAS — PEDIDO A PROVEEDOR", MARGIN, 12);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(`Generado: ${new Date().toLocaleString()}`, MARGIN, 20);
  y = 36;

  // ── Info del proyecto ──
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("ESPECIFICACIONES DEL PROYECTO", MARGIN, y);
  y += 5;
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 5;

  doc.setFont(undefined, "normal");
  const specs = [
    ["Dimensiones del libro", `${dimensions.alto} mm (alto) × ${dimensions.ancho} mm (ancho) × ${dimensions.profundidad} mm (profundidad)`],
    ["Tipo de caja", boxType.name],
    ["Material", `${material.name}`],
    ["Grosor del material", `${material.thickness} mm`],
  ];
  specs.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont(undefined, "normal");
    doc.text(value, MARGIN + 42, y);
    y += 5.5;
  });

  if (needsAngleCut) {
    y += 2;
    doc.setFillColor(255, 230, 230);
    doc.rect(MARGIN, y - 3, W - MARGIN * 2, 8, "F");
    doc.setTextColor(180, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("⚠  NOTA: Requiere corte a 45° en todas las aristas de unión (grosor > 3 mm)", MARGIN + 2, y + 2);
    doc.setTextColor(30, 30, 30);
    y += 12;
  }

  y += 4;

  // ── Tabla de piezas ──
  doc.setFont(undefined, "bold");
  doc.setFontSize(9);
  doc.text("TABLA DE CORTE", MARGIN, y);
  y += 5;
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 2;

  // Columnas: Pieza | Descripción | Cant | Ancho mm | Alto mm | Área total mm² | Medida Final
  const COL = [MARGIN, 37, 85, 100, 116, 132, 160];
  const HEADERS = ["Pieza", "Descripción", "Cant.", "Ancho\n(mm)", "Alto\n(mm)", "Área total\n(mm²)", "Medida Final"];

  // Header row background
  doc.setFillColor(220, 230, 245);
  doc.rect(MARGIN, y, W - MARGIN * 2, 10, "F");
  y += 6;
  doc.setFont(undefined, "bold");
  doc.setFontSize(8);
  HEADERS.forEach((h, i) => {
    doc.text(h.replace("\n", " "), COL[i], y);
  });
  y += 6;
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 3;

  // Rows
  doc.setFont(undefined, "normal");
  doc.setFontSize(8);
  let totalArea = 0;
  pieces.forEach((p, idx) => {
    if (y > 265) {
      doc.addPage();
      y = MARGIN;
    }
    const areaTotal = p.measureA * p.measureB * p.qty;
    totalArea += areaTotal;

    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 252);
      doc.rect(MARGIN, y - 3, W - MARGIN * 2, 7, "F");
    }

    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text(p.name, COL[0], y);
    doc.setFont(undefined, "normal");

    // Truncate description if too long
    const descLines = doc.splitTextToSize(p.description, 46);
    doc.text(descLines[0], COL[1], y);
    doc.text(String(p.qty), COL[2], y);
    doc.text(String(p.measureA), COL[3], y);
    doc.text(String(p.measureB), COL[4], y);
    doc.text(areaTotal.toLocaleString(), COL[5], y);
    doc.text(p.finalMeasure, COL[6], y);
    y += 7;
  });

  // Totals row
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 4;
  doc.setFont(undefined, "bold");
  doc.setFontSize(9);
  doc.text(`ÁREA TOTAL NETA: ${(totalArea / 1e6).toFixed(4)} m²`, MARGIN, y);
  doc.text(`(${totalArea.toLocaleString()} mm²)`, MARGIN + 60, y);
  y += 8;

  // ── Pie de página ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, "normal");
    doc.text(`Página ${i} de ${totalPages}  ·  Reporte generado automáticamente`, MARGIN, 292);
  }

  doc.save(`pedido-proveedor-${boxType.id}-${Date.now()}.pdf`);
}

// ── COMPONENTE ───────────────────────────────────────────────────────────────
export default function ExportReportDialog({ pieces, dimensions, boxType, material, needsAngleCut }) {
  const [open, setOpen] = useState(false);

  const totalPieces = pieces.reduce((s, p) => s + p.qty, 0);
  const totalAreaM2 = (pieces.reduce((s, p) => s + p.measureA * p.measureB * p.qty, 0) / 1e6).toFixed(4);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="h-12 px-8 text-base font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        title="Exportar reporte para proveedor"
      >
        <FileText className="mr-2 h-4 w-4" />
        Reporte proveedor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Exportar reporte para proveedor
            </DialogTitle>
          </DialogHeader>

          {/* Resumen */}
          <div className="rounded-lg bg-secondary px-4 py-3 space-y-1 text-sm">
            <p className="font-medium text-foreground">{boxType.name}</p>
            <p className="text-muted-foreground">
              Libro: {dimensions.alto} × {dimensions.ancho} × {dimensions.profundidad} mm
            </p>
            <p className="text-muted-foreground">
              Material: {material.name} ({material.thickness} mm)
            </p>
            <div className="flex gap-4 pt-1">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                {pieces.length} tipos · {totalPieces} piezas
              </span>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                Área neta: {totalAreaM2} m²
              </span>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">Elige el formato de exportación:</p>

            {/* CSV */}
            <button
              onClick={() => {
                exportCSV({ pieces, dimensions, boxType, material });
                setOpen(false);
              }}
              className="w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-secondary/60 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-green-500/10">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">CSV — Hoja de cálculo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compatible con Excel, Google Sheets, LibreOffice. Incluye todas las dimensiones y áreas.
                </p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </button>

            {/* PDF */}
            <button
              onClick={() => {
                exportProviderPDF({ pieces, dimensions, boxType, material, needsAngleCut });
                setOpen(false);
              }}
              className="w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-secondary/60 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-red-500/10">
                <FileText className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">PDF — Pedido formal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Documento listo para entregar al proveedor. Incluye especificaciones, tabla de corte y área total.
                </p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}