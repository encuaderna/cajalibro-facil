import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw, Loader2, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RevisionHistory({ projectId, onRestore }) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoreId, setRestoreId] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (open) loadRevisions();
  }, [open, projectId]);

  const loadRevisions = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.ProjectRevision.filter(
        { projectId },
        "-revisionNumber"
      );
      setRevisions(data);
    } catch (err) {
      console.error("Error loading revisions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreId) return;

    setRestoring(true);
    try {
      const revision = revisions.find((r) => r.id === restoreId);
      if (!revision) return;

      // Llamar callback con los datos de la revisión
      onRestore?.({
        dimensions: revision.dimensions,
        boxType: revision.boxType,
        material: revision.material,
      });

      setRestoreId(null);
      setOpen(false);
    } catch (err) {
      console.error("Error restoring revision:", err);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        Historial de revisiones
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => !loading && !restoring && setOpen(false)}
        >
          <div
            className="bg-card rounded-t-lg sm:rounded-lg border border-border w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Historial de revisiones
              </h3>
              <button
                onClick={() => setOpen(false)}
                disabled={loading || restoring}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : revisions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay revisiones anteriores para este proyecto.
              </p>
            ) : (
              <div className="space-y-2">
                {revisions.map((rev, idx) => (
                  <div
                    key={rev.id}
                    className="border border-border/50 rounded-lg p-3 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium text-primary">
                            v{rev.revisionNumber}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {new Date(rev.created_date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-2">
                          <div>
                            <span className="font-medium">Libro:</span> {rev.dimensions.alto}×
                            {rev.dimensions.ancho}×{rev.dimensions.profundidad} mm
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {rev.boxType.name}
                          </div>
                          <div>
                            <span className="font-medium">Material:</span> {rev.material.name}
                          </div>
                        </div>
                        {rev.revisionNotes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            "{rev.revisionNotes}"
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => setRestoreId(rev.id)}
                        variant="outline"
                        size="sm"
                        disabled={restoring}
                        className="shrink-0 gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="hidden sm:inline">Restaurar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restore confirmation dialog */}
      <AlertDialog open={!!restoreId} onOpenChange={(o) => !o && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar esta revisión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cargarán las dimensiones, tipo de caja y material de esta revisión.
              Los cambios no se guardarán automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={restoring}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {restoring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Restaurar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}