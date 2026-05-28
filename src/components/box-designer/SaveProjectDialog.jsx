import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Save, Loader2 } from "lucide-react";

export default function SaveProjectDialog({
  open,
  onOpenChange,
  dimensions,
  boxType,
  material,
  onSuccess,
}) {
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!projectName.trim()) {
      setError("El nombre del proyecto es requerido");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Crear o actualizar proyecto
      const existingProject = await base44.entities.Project.filter(
        { projectName: projectName.trim() }
      ).then((results) => results[0] || null);

      let projectId;

      if (existingProject) {
        // Actualizar proyecto existente
        await base44.entities.Project.update(existingProject.id, {
          dimensions,
          boxType,
          material,
          notes: notes.trim(),
        });
        projectId = existingProject.id;
      } else {
        // Crear nuevo proyecto
        const newProject = await base44.entities.Project.create({
          projectName: projectName.trim(),
          dimensions,
          boxType,
          material,
          notes: notes.trim(),
        });
        projectId = newProject.id;
      }

      // Crear revisión
      if (projectId) {
        const revisions = await base44.entities.ProjectRevision.filter(
          { projectId },
          "-revisionNumber",
          1
        );
        const nextRevisionNumber = (revisions[0]?.revisionNumber || 0) + 1;

        await base44.entities.ProjectRevision.create({
          projectId,
          revisionNumber: nextRevisionNumber,
          dimensions,
          boxType,
          material,
          revisionNotes: revisionNotes.trim(),
        });
      }

      onSuccess?.();
      setProjectName("");
      setNotes("");
      setRevisionNotes("");
      onOpenChange(false);
    } catch (err) {
      setError("Error al guardar el proyecto. Intenta de nuevo.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Guardar proyecto</DialogTitle>
          <DialogDescription>
            Guarda tu configuración actual para poder recuperarla más tarde.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Nombre del proyecto *
            </Label>
            <Input
              id="project-name"
              placeholder="Ej: Caja de lujo A4"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError("");
              }}
              disabled={saving}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-notes" className="text-sm font-medium">
              Notas del proyecto (opcional)
            </Label>
            <Textarea
              id="project-notes"
              placeholder="Ej: Para edición limitada, usar cartón pluma color crema..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
              className="h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revision-notes" className="text-sm font-medium">
              Notas de la revisión (opcional)
            </Label>
            <Textarea
              id="revision-notes"
              placeholder="Ej: Aumenté el alto para ajustar al formato A4..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              disabled={saving}
              className="h-16 resize-none"
            />
          </div>

          <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Configuración a guardar:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• Libro: {dimensions.alto} × {dimensions.ancho} × {dimensions.profundidad} mm</li>
              <li>• Tipo: {boxType.name}</li>
              <li>• Material: {material.name} ({material.thickness} mm)</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}