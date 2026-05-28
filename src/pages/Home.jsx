import React, { useState } from "react";
import StepIndicator from "@/components/box-designer/StepIndicator";
import StepDimensions from "@/components/box-designer/StepDimensions";
import StepBoxType from "@/components/box-designer/StepBoxType";
import StepMaterial from "@/components/box-designer/StepMaterial";
import StepResults from "@/components/box-designer/StepResults";

const INITIAL_DIMENSIONS = { alto: 0, ancho: 0, profundidad: 0 };

export default function Home() {
  const [step, setStep] = useState(1);
  const [dimensions, setDimensions] = useState(INITIAL_DIMENSIONS);
  const [boxType, setBoxType] = useState(null);
  const [material, setMaterial] = useState(null);

  const reset = () => {
    setStep(1);
    setDimensions(INITIAL_DIMENSIONS);
    setBoxType(null);
    setMaterial(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Diseño Técnico de Cajas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Calculadora de piezas para cajas de libros a medida
          </p>
        </header>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <StepDimensions
            dimensions={dimensions}
            onChange={setDimensions}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepBoxType
            selectedType={boxType}
            onSelect={setBoxType}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepMaterial
            selectedMaterial={material}
            onSelect={setMaterial}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepResults
            dimensions={dimensions}
            boxType={boxType}
            material={material}
            onBack={() => setStep(3)}
            onReset={reset}
          />
        )}
      </div>
    </div>
  );
}