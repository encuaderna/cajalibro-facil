import React from "react";

const STEP_LABELS = [
  "Dimensiones",
  "Tipo de caja",
  "Material",
  "Resultados",
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-3 mb-10" role="navigation" aria-label="Pasos del proceso">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && (
              <div
                className={`h-px w-6 sm:w-10 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {stepNum}
              </div>
              <span
                className={`hidden sm:inline text-sm ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}