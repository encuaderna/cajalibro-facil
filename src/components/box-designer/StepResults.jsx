import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, AlertTriangle, RotateCcw } from "lucide-react";
import AssemblyProgress from "@/components/box-designer/AssemblyProgress";
import { calculatePieces, getInstructions } from "@/lib/boxCalculations";
import PieceDiagram from "@/components/box-designer/PieceDiagram";
import BoxSchemaSVG from "@/components/box-designer/BoxSchemaSVG";
import BoxViewer3D from "@/components/box-designer/BoxViewer3D";
import SheetOptimizer from "@/components/box-designer/SheetOptimizer";
import CostEstimator from "@/components/box-designer/CostEstimator";
import SaveProjectDialog from "@/components/box-designer/SaveProjectDialog";
import InteractiveSheetLayout from "@/components/box-designer/InteractiveSheetLayout";
import MultiSheetManager from "@/components/box-designer/MultiSheetManager";
import ExportReportDialog from "@/components/box-designer/ExportReportDialog";
import SnapshotManager from "@/components/box-designer/SnapshotManager";
import PhotoCarousel from "@/components/box-designer/PhotoCarousel";
import PrintTemplateButton from "@/components/box-designer/PrintTemplateButton";
import jsPDF from "jspdf";
import { exportLayoutPdf } from "@/lib/exportPdfLayout";

export default function StepResults({
  dimensions,
  boxType,
  material,
  onBack,
  onReset,
  onRestore,
}) {
  const { pieces, needsAngleCut } = useMemo(
    () => calculatePieces(dimensions, boxType, material),
    [dimensions, boxType, material]
  );

  const instructions = useMemo(
    () => getInstructions(boxType, material),
    [boxType, material]
  );

  const [checked, setChecked] = useState(() =>
    instructions.map(() => false)
  );
  const [selectedPieceIndex, setSelectedPieceIndex] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sheets, setSheets] = useState([]);

  const toggleCheck = (i) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.text("Diseño Técnico — Caja para Libro", 15, y);
    y += 12;

    doc.setFontSize(10);
    doc.text(`Libro: ${dimensions.alto} × ${dimensions.ancho} × ${dimensions.profundidad} mm`, 15, y);
    y += 6;
    doc.text(`Tipo: ${boxType.name}`, 15, y);
    y += 6;
    doc.text(`Material: ${material.name} (${material.thickness} mm)`, 15, y);
    y += 12;

    // Table header
    doc.setFontSize(11);
    doc.text("Tabla de Corte", 15, y);
    y += 8;

    doc.setFontSize(9);
    const cols = [15, 65, 105, 135];
    doc.setFont(undefined, "bold");
    doc.text("Pieza", cols[0], y);
    doc.text("Descripción", cols[1], y);
    doc.text("Cantidad", cols[2], y);
    doc.text("Medida Final", cols[3], y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont(undefined, "normal");
    pieces.forEach((p) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(p.name, cols[0], y);
      doc.text(p.description, cols[1], y);
      doc.text(String(p.qty), cols[2], y);
      doc.text(p.finalMeasure, cols[3], y);
      y += 6;
    });

    if (needsAngleCut) {
      y += 6;
      doc.setFont(undefined, "bold");
      doc.text(`ALERTA: Cortar aristas a 45° (grosor > 3 mm).`, 15, y);
      doc.setFont(undefined, "normal");
      y += 8;
    }

    y += 10;
    doc.setFontSize(11);
    doc.text("Consejos de Fabricación", 15, y);
    y += 8;

    doc.setFontSize(9);
    const tips = [
      "• Verifica todas las dimensiones con calibre antes de cortar.",
      "• Mantén el material a 20-25°C y 45-55% humedad para evitar deformaciones.",
      "• Aplica pegamento de forma uniforme; usa rodillo o brocha para distribuir sin aire.",
      "• Deja secar bajo presión (prensa o peso) durante 24h mínimo.",
      "• En cortes a 45°, realiza múltiples pasadas ligeras en lugar de una profunda.",
      "• Protege aristas sobresalientes con refuerzo o bisel tras montaje."
    ];
    tips.forEach((tip) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(tip, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * 4 + 1;
    });

    y += 6;
    doc.setFontSize(11);
    doc.text("Instrucciones de Montaje", 15, y);
    y += 8;

    doc.setFontSize(9);
    instructions.forEach((inst, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`${i + 1}. ${inst}`, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * 5 + 2;
    });

    doc.save(`caja-${boxType.id}-${Date.now()}.pdf`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Paso 4 — Resultados de Cálculo
      </h2>
      <p className="text-muted-foreground text-sm mb-2">
        Libro: {dimensions.alto} × {dimensions.ancho} × {dimensions.profundidad} mm
        &nbsp;·&nbsp; {boxType.name} &nbsp;·&nbsp; {material.name} ({material.thickness} mm)
      </p>

      {needsAngleCut && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 mt-4 mb-6">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            El grosor del material ({material.thickness} mm) supera los 3 mm.
            Se requiere corte a 45° en todas las aristas de unión.
          </p>
        </div>
      )}

      {/* ── Visor 3D ── */}
      <div className="mt-6">
        <BoxViewer3D boxType={boxType} dimensions={dimensions} material={material} />
      </div>

      {/* ── Carrusel de fotos ── */}
      <PhotoCarousel />

      {/* ── Visualización SVG ── */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Esquema isométrico de la caja */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Esquema de la caja
          </p>
          <BoxSchemaSVG boxType={boxType} highlightedPiece={pieces[selectedPieceIndex]} />
        </div>

        {/* Diagrama acotado de la pieza seleccionada */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Pieza seleccionada — vista de corte
          </p>
          <PieceDiagram piece={pieces[selectedPieceIndex]} highlighted />
        </div>
      </div>

      {/* Tabla de piezas */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Pieza</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Descripción</th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground">Cant.</th>
              <th className="text-right py-3 px-3 font-medium text-muted-foreground">Medida Final</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((p, i) => (
              <tr
                key={i}
                onClick={() => setSelectedPieceIndex(i)}
                className={`border-b border-border/50 cursor-pointer transition-colors ${
                  selectedPieceIndex === i
                    ? "bg-primary/8 border-l-2 border-l-primary"
                    : "hover:bg-secondary/60"
                }`}
                aria-selected={selectedPieceIndex === i}
              >
                <td className={`py-3 px-3 font-medium ${selectedPieceIndex === i ? "text-primary" : "text-foreground"}`}>
                  {p.name}
                </td>
                <td className="py-3 px-3 text-muted-foreground">{p.description}</td>
                <td className="py-3 px-3 text-center text-foreground">{p.qty}</td>
                <td className="py-3 px-3 text-right font-mono text-foreground">{p.finalMeasure}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-2 pl-1">
          Haz clic en una fila para ver el diagrama de esa pieza.
        </p>
      </div>

      {/* ── Distribución en múltiples láminas ── */}
      <div className="mt-6">
        <MultiSheetManager pieces={pieces} onSheetsChange={setSheets} />
      </div>

      {/* ── Optimización de corte ── */}
      <div className="mt-4">
        <SheetOptimizer pieces={pieces} />
      </div>

      {/* ── Estimación de coste ── */}
      <div className="mt-4">
        <CostEstimator pieces={pieces} />
      </div>

      {/* ── Editor interactivo 2D ── */}
      <div className="mt-4">
        <InteractiveSheetLayout pieces={pieces} sheetW={1000} sheetH={700} />
      </div>

      {/* Instrucciones */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Instrucciones de montaje
        </h3>
        <AssemblyProgress checked={checked} instructions={instructions} />
        <ol className="space-y-3">
          {instructions.map((inst, i) => {
            const isAlert = inst.startsWith("ALERTA");
            return (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Checkbox
                    id={`step-${i}`}
                    checked={checked[i]}
                    onCheckedChange={() => toggleCheck(i)}
                    className="h-5 w-5"
                  />
                </div>
                <label
                  htmlFor={`step-${i}`}
                  className={`text-sm leading-relaxed cursor-pointer ${
                    isAlert
                      ? "text-destructive font-medium"
                      : checked[i]
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {i + 1}. {inst}
                </label>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Acciones */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 text-base">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={() => setSaveDialogOpen(true)} className="h-12 px-8 text-base font-medium bg-primary/90 hover:bg-primary">
          💾 Guardar proyecto
        </Button>
        <Button 
          onClick={handleExportPDF} 
          className="h-12 px-8 text-base font-medium"
          title="Exporta PDF de corte técnico"
        >
          <Download className="mr-2 h-4 w-4" />
          PDF de corte
        </Button>
        <Button 
          onClick={() => sheets.length > 0 && exportLayoutPdf(sheets, pieces, 1000, 700)}
          disabled={sheets.length === 0}
          className="h-12 px-8 text-base font-medium"
          title="Exporta PDF con layout de láminas"
        >
          <Download className="mr-2 h-4 w-4" />
          PDF layout
        </Button>
        <ExportReportDialog
          pieces={pieces}
          dimensions={dimensions}
          boxType={boxType}
          material={material}
          needsAngleCut={needsAngleCut}
        />
        <PrintTemplateButton
          pieces={pieces}
          dimensions={dimensions}
          boxType={boxType}
          material={material}
        />
        <SnapshotManager
          dimensions={dimensions}
          boxType={boxType}
          material={material}
          onRestore={onRestore}
        />
        <Button variant="outline" onClick={onReset} className="h-12 px-6 text-base">
          <RotateCcw className="mr-2 h-4 w-4" />
          Nuevo diseño
        </Button>
      </div>

      {/* Save project dialog */}
      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        dimensions={dimensions}
        boxType={boxType}
        material={material}
        onSuccess={() => {
          setSaveDialogOpen(false);
        }}
      />
    </div>
  );
}