import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

const MATERIAL_SPECS = {
  // Propiedades estimadas por tipo de material (puedes actualizar con datos reales)
  cartón: { resistencia: "Media", entregas: "3-5 días" },
  kraft: { resistencia: "Alta", entregas: "5-7 días" },
  cartulina: { resistencia: "Media-Alta", entregas: "2-3 días" },
  microcanal: { resistencia: "Baja", entregas: "1-2 días" },
  default: { resistencia: "Media", entregas: "5-7 días" },
};

export default function MaterialComparisonTable() {
  const [materials, setMaterials] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      const data = await base44.entities.Material.list();
      setMaterials(data || []);
      setLoading(false);
    };
    loadMaterials();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Cargando materiales...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return null;
  }

  const getSpecs = (name) => {
    const lower = name.toLowerCase();
    for (const [key, specs] of Object.entries(MATERIAL_SPECS)) {
      if (lower.includes(key)) return specs;
    }
    return MATERIAL_SPECS.default;
  };

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-foreground">
          📊 Comparativa de Materiales
        </h3>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-muted-foreground">Material</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Grosor (mm)</th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground">Precio/m²</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Resistencia</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, i) => {
                const specs = getSpecs(mat.name);
                return (
                  <tr
                    key={mat.id || i}
                    className="border-b border-border/50 hover:bg-secondary/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-foreground">
                      {mat.name}
                      {mat.supplier && (
                        <p className="text-xs text-muted-foreground mt-1">{mat.supplier}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-foreground">
                      {mat.thickness}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">
                      €{mat.pricePerSquareMeter?.toFixed(2) || "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs bg-secondary/80 px-2 py-1 rounded">
                        {specs.resistencia}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-muted-foreground">
                      {specs.entregas}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-3 pl-1">
            💡 Ordena por grosor y precio/m² para encontrar la mejor opción.
          </p>
        </div>
      )}
    </div>
  );
}