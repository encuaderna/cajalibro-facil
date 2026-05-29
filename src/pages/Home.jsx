import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import AppHeader from "@/components/AppHeader";
import Welcome from "@/pages/Welcome";
import MaterialLibrary from "@/components/box-designer/MaterialLibrary";
import StepIndicator from "@/components/box-designer/StepIndicator";
import StepDimensions from "@/components/box-designer/StepDimensions";
import StepBoxType from "@/components/box-designer/StepBoxType";
import StepMaterial from "@/components/box-designer/StepMaterial";
import StepResults from "@/components/box-designer/StepResults";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { loadDraft, clearDraft, hasDraft, useAutoSaveDraft } from "@/hooks/useLocalDraft";
import DraftRestoreBanner from "@/components/box-designer/DraftRestoreBanner";
import SummaryBar from "@/components/box-designer/SummaryBar";
import GuidedTour from "@/components/box-designer/GuidedTour";
import AppFooter from "@/components/AppFooter";

const INITIAL_DIMENSIONS = { alto: 0, ancho: 0, profundidad: 0 };

export default function Home() {
  const { prefs, isLoaded } = useAppPreferences();
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('app_welcome_shown') !== 'true';
  });
  const [step, setStep] = useState(1);
  const [dimensions, setDimensions] = useState(INITIAL_DIMENSIONS);
  const [boxType, setBoxType] = useState(null);
  const [material, setMaterial] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(() => hasDraft() ? loadDraft() : null);

  // Auto-guardado en localStorage
  useAutoSaveDraft({ step, dimensions, boxType, material });

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
    clearDraft();
    setPendingDraft(null);
  };

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    setDimensions(pendingDraft.dimensions || INITIAL_DIMENSIONS);
    setBoxType(pendingDraft.boxType || null);
    setMaterial(pendingDraft.material || null);
    setStep(pendingDraft.step || 1);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem('app_welcome_shown', 'true');
    setShowWelcome(false);
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (showWelcome) {
    return <Welcome onGetStarted={handleWelcomeComplete} />;
  }

  return (
    <div 
      className="min-h-screen bg-background transition-all duration-300"
      style={{
        fontFamily: prefs.dyslexicFont ? "'OpenDyslexic', sans-serif" : 'inherit',
        filter: prefs.highContrast ? 'contrast(1.5) saturate(0.8)' : 'none',
        fontSize: `${prefs.textScale}rem`,
        opacity: prefs.focusMode ? 0.95 : 1,
      }}
    >
      <AppHeader />
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
          <div className="flex items-center gap-3">
            <MaterialLibrary />
            <GuidedTour />
          </div>
        </header>

        <DraftRestoreBanner
          draft={pendingDraft}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />

        <SummaryBar
          step={step}
          dimensions={dimensions}
          boxType={boxType}
          material={material}
        />
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
            onRestore={({ dimensions: d, boxType: bt, material: m }) => {
              setDimensions(d);
              setBoxType(bt);
              setMaterial(m);
              setStep(4);
            }}
          />
        )}
      </div>
      <AppFooter />
    </div>
  );
}