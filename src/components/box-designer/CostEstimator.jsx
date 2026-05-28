import React, { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function CostEstimator({ pieces }) {
  const [open, setOpen] = useState(false);
  const [pricePerM2, setPricePerM2] = useState(12);

  // Área total en mm² → m²
  const totalAreaM2 = useMemo(() => {
    return pieces.reduce((sum, p) => sum + p.measureA * p.measureB * p.qty, 0) / 1e6;
  }, [pieces]);

  const totalCost = (totalAreaM2 * pricePerM2).toFixed(2);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabecera colapsable */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="cost-estimator-body"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calculator className="h-4 w-4 text-primary" />
          Estimación de coste de material
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id="cost-estimator-body" className="p-4 space-y-5">

          {/* Área total */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Área total de piezas" value={`${totalAreaM2.toFixed(4)} m²`} />
            <Stat label="Precio por m²" value={`${pricePerM2.toFixed(2)} €`} />
            <Stat label="Coste estimado" value={`${totalCost} €`} highlight />
          </div>

          {/* Control de precio */}
          <div className="space-y-2">
            <label
              htmlFor="price-input"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Precio del material (€ / m²)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="price-input"
                type="range"
                min={1}
                max={200}
                step={0.5}
                value={pricePerM2}
                onChange={(e) => setPricePerM2(parseFloat(e.target.value))}
                className="flex-1 accent-primary h-2 rounded cursor-pointer"
              />
              <input
                type="number"
                min={0}
                step={0.5}
                value={pricePerM2}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 0) setPricePerM2(v);
                }}
                className="w-24 h-9 rounded-md border border-input bg-secondary px-3 text-sm text-foreground text-right font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">€/m²</span>
            </div>
          </div>

          {/* Desglose por pieza */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Desglose por pieza
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Pieza</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Cant.</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Área unit.</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pieces.map((p, i) => {
                  const unitArea = (p.measureA * p.measureB) / 1e6;
                  const subArea  = unitArea * p.qty;
                  const subCost  = (subArea * pricePerM2).toFixed(2);
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2 text-foreground">{p.name}</td>
                      <td className="py-2 px-2 text-center text-muted-foreground">{p.qty}</td>
                      <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                        {unitArea.toFixed(4)} m²
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-foreground">
                        {subCost} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={3} className="py-2 px-2 font-medium text-foreground text-right">
                    Total
                  </td>
                  <td className="py-2 px-2 text-right font-semibold font-mono text-primary">
                    {totalCost} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            * El cálculo se basa en el área neta de cada pieza. Añade un margen de desperdicio según el resultado del optimizador de lámina.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2.5">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-lg font-semibold font-mono ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}