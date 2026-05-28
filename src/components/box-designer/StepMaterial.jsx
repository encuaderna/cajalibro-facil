import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import MaterialLibrary from "@/components/box-designer/MaterialLibrary";

export default function StepMaterial({ selectedMaterial, onSelect, onNext, onBack }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Material.list("-created_date");
      setMaterials(data);
    } catch (err) {
      console.error("Error loading materials:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Paso 3 — Material
      </h2>
      <p className="text-muted-foreground text-sm mb-2">
        Selecciona el material para la caja.
      </p>
      <div className="mb-6">
        <MaterialLibrary />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No hay materiales guardados. Crea uno en la biblioteca para continuar.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-lg">
          {materials.map((mat) => {
            const isSelected = selectedMaterial?.id === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => onSelect(mat)}
                className={`w-full text-left p-5 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary hover:border-muted-foreground/30"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-medium text-foreground">
                      {mat.name}
                    </span>
                    <div className="text-xs text-muted-foreground mt-1.5 space-y-1">
                      <p>Espesor: {mat.thickness} mm</p>
                      <p>Precio: €{mat.pricePerSquareMeter}/m²</p>
                      {mat.supplier && <p>Proveedor: {mat.supplier}</p>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 text-base">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedMaterial}
          className="h-12 px-8 text-base font-medium"
        >
          Calcular piezas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}