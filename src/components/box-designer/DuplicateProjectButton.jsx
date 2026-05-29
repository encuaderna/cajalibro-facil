import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";

export default function DuplicateProjectButton({ project, onDuplicated }) {
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const newProject = await base44.entities.Project.create({
        projectName: `${project.projectName} (copia)`,
        dimensions: project.dimensions,
        boxType: project.boxType,
        material: project.material,
        notes: project.notes,
      });
      // Crear revisión inicial de la copia
      await base44.entities.ProjectRevision.create({
        projectId: newProject.id,
        revisionNumber: 1,
        dimensions: project.dimensions,
        boxType: project.boxType,
        material: project.material,
        revisionNotes: "Copia del proyecto original",
      });
      onDuplicated?.();
    } catch (err) {
      console.error("Error duplicando proyecto:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDuplicate}
      disabled={loading}
      className="w-full sm:w-auto"
      title="Duplicar este proyecto"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}