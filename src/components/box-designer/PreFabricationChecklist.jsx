import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";

const PREFAB_ITEMS = [
  { id: 1, item: "Material marcado correctamente con medidas", category: "Material" },
  { id: 2, item: "Herramientas calibradas (regla, escuadra, cortador)", category: "Herramientas" },
  { id: 3, item: "Temperatura ambiente 20-25°C", category: "Condiciones" },
  { id: 4, item: "Humedad relativa 45-55%", category: "Condiciones" },
  { id: 5, item: "Stock de pegamento y brocha/rodillo listos", category: "Materiales consumibles" },
  { id: 6, item: "Prensa o pesos disponibles para secado", category: "Equipo" },
  { id: 7, item: "Área de trabajo limpia y despejada", category: "Espacio" },
  { id: 8, item: "Sistema de corte a 45° preparado (si aplica)", category: "Equipo" },
];

export default function PreFabricationChecklist() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(false);
  const allDone = Object.keys(checked).length === PREFAB_ITEMS.length && Object.values(checked).every(Boolean);

  const toggleCheck = (id) => {
    setChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [...new Set(PREFAB_ITEMS.map(item => item.category))];

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-foreground">✓ Checklist Pre-Fabricación</h3>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {categories.map(category => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {category}
              </p>
              <div className="space-y-2 ml-2">
                {PREFAB_ITEMS.filter(item => item.category === category).map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`prefab-${item.id}`}
                      checked={checked[item.id] || false}
                      onCheckedChange={() => toggleCheck(item.id)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`prefab-${item.id}`}
                      className={`text-sm cursor-pointer ${
                        checked[item.id]
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {item.item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {allDone && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-400 font-medium">
                ¡Listo para fabricar! ✨
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}