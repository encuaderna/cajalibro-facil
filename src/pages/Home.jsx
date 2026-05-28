import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import MaterialLibrary from "@/components/box-designer/MaterialLibrary";
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

  // Cargar proyecto guardado desde sessionStorage (después de hacer clic en "Cargar" en MyProjects)
  useEffect(() => {
    const loaded = sessionStorage.getItem("loadedProject");
    if (loaded) {
      try {
        const project = JSON.parse(loaded);
        setDimensions(project.dimensions);
        setBoxType(project.boxType);
        setMaterial(project.material);
        setStep(4); // Ir directamente a resultados
        sessionStorage.removeItem("loadedProject");
      } catch (err) {
        console.error("Error loading project:", err);
      }
    }
  }, []);

  const reset = () => {
    setStep(1);
    setDimensions(INITIAL_DIMENSIONS);
    setBoxType(null);
    setMaterial(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Diseño Técnico de Cajas
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Calculadora de piezas para cajas de libros a medida
              </p>
            </div>
            <Link to="/mis-proyectos">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                📁 Mis Proyectos
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <MaterialLibrary />
          </div>
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