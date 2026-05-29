import React from "react";

export default function AssemblyProgress({ checked, total }) {
  const done = checked.filter(Boolean).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {done}/{total} pasos
        {done === total && total > 0 && (
          <span className="ml-1.5 text-primary">✓ Completado</span>
        )}
      </span>
    </div>
  );
}