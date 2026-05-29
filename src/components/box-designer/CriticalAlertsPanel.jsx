import React, { useMemo } from "react";
import { AlertTriangle, Thermometer, Droplets, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CriticalAlertsPanel({ dimensions, material, needsAngleCut }) {
  const alerts = useMemo(() => {
    const alertList = [];

    // Alerta de corte a 45°
    if (needsAngleCut) {
      alertList.push({
        id: "angle_cut",
        type: "critical",
        icon: AlertTriangle,
        title: "Corte a 45° Requerido",
        message: `Material ${material.thickness}mm requiere bisel en todas las aristas. Usa múltiples pasadas ligeras.`,
      });
    }

    // Alerta de dimensiones muy grandes
    const maxDim = Math.max(dimensions.alto, dimensions.ancho, dimensions.profundidad);
    if (maxDim > 400) {
      alertList.push({
        id: "large_dims",
        type: "warning",
        icon: AlertCircle,
        title: "Dimensiones Grandes",
        message: "Dimensiones >400mm requieren refuerzo adicional en costuras.",
      });
    }

    // Alerta de material delgado
    if (material.thickness < 1.5) {
      alertList.push({
        id: "thin_material",
        type: "warning",
        icon: AlertCircle,
        title: "Material Delgado",
        message: "Grosor <1.5mm. Usa prensa durante 24h mínimo y evita humedad.",
      });
    }

    // Alerta de material grueso
    if (material.thickness > 4) {
      alertList.push({
        id: "thick_material",
        type: "warning",
        icon: AlertTriangle,
        title: "Material Grueso",
        message: `Grosor ${material.thickness}mm. Asegura herramientas afiladas y calibradas.`,
      });
    }

    return alertList;
  }, [dimensions, material, needsAngleCut]);

  const conditions = [
    { icon: Thermometer, label: "Temperatura", value: "20-25°C", critical: true },
    { icon: Droplets, label: "Humedad", value: "45-55%", critical: true },
  ];

  return (
    <div className="mt-6 space-y-4">
      {/* Condiciones Críticas */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          ⚙️ Condiciones Críticas Antes de Fabricar
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {conditions.map((cond) => {
            const Icon = cond.icon;
            return (
              <div
                key={cond.label}
                className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {cond.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{cond.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertas de Fabricación */}
      {alerts.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            🚨 Alertas de Fabricación
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              const bgColor =
                alert.type === "critical"
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-yellow-500/10 border-yellow-500/30";
              const textColor =
                alert.type === "critical" ? "text-destructive" : "text-yellow-600";

              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${textColor}`} />
                    <div>
                      <p className={`text-sm font-semibold ${textColor}`}>
                        {alert.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado OK */}
      {alerts.length === 0 && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-400">
                ✓ Parámetros Normales
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sin alertas críticas. Procede con el checklist pre-fabricación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}