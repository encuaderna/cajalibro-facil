import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Play, Loader2, FolderOpen, Clock } from "lucide-react";
import RevisionHistory from "@/components/box-designer/RevisionHistory";

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [restoringProjectId, setRestoringProjectId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Project.list("-updated_date");
      setProjects(data);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (project) => {
    // Guardar proyecto en sessionStorage para recuperar en Home
    sessionStorage.setItem("loadedProject", JSON.stringify(project));
    navigate("/");
  };

  const handleRestoreRevision = (projectId, restoredData) => {
    // Actualizar el proyecto con los datos restaurados
    sessionStorage.setItem(
      "loadedProject",
      JSON.stringify({
        id: projectId,
        ...restoredData,
      })
    );
    navigate("/");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await base44.entities.Project.delete(deleteId);
      setProjects(projects.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting project:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Mis Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus configuraciones de cajas guardadas.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-1">No tienes proyectos guardados aún.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crea una configuración de caja y guárdala como proyecto desde los resultados.
            </p>
            <Button onClick={() => navigate("/")} variant="default">
              Ir al diseñador
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border border-border bg-card p-4 hover:bg-card/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 break-words">
                      {project.projectName}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground/70">Libro</span>
                        <p className="font-mono text-foreground">
                          {project.dimensions.alto} × {project.dimensions.ancho} × {project.dimensions.profundidad} mm
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground/70">Tipo</span>
                        <p className="text-foreground">{project.boxType.name}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground/70">Material</span>
                        <p className="text-foreground">{project.material.name}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground/70">Guardado</span>
                        <p className="text-foreground">
                          {new Date(project.updated_date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    {project.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Notas: {project.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      onClick={() => handleLoad(project)}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Cargar
                    </Button>
                    <RevisionHistory
                      projectId={project.id}
                      onRestore={(data) => handleRestoreRevision(project.id, data)}
                    />
                    <Button
                      onClick={() => setDeleteId(project.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proyecto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}