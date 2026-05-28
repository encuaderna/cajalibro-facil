import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MaterialLibrary() {
  const [open, setOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    thickness: "",
    pricePerSquareMeter: "",
    supplier: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) loadMaterials();
  }, [open]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Material.list("-created_date");
      setMaterials(data);
    } catch (err) {
      console.error("Error loading materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!formData.name.trim() || !formData.thickness || !formData.pricePerSquareMeter) {
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Material.create({
        name: formData.name.trim(),
        thickness: parseFloat(formData.thickness),
        pricePerSquareMeter: parseFloat(formData.pricePerSquareMeter),
        supplier: formData.supplier.trim() || null,
      });

      setFormData({ name: "", thickness: "", pricePerSquareMeter: "", supplier: "" });
      setShowForm(false);
      await loadMaterials();
    } catch (err) {
      console.error("Error adding material:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await base44.entities.Material.delete(deleteId);
      setDeleteId(null);
      await loadMaterials();
    } catch (err) {
      console.error("Error deleting material:", err);
    } finally {
      setDeleting(false);
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
        📚 Biblioteca de materiales
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => !loading && !saving && !deleting && setOpen(false)}
        >
          <div
            className="bg-card rounded-t-lg sm:rounded-lg border border-border w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Biblioteca de materiales
              </h3>
              <button
                onClick={() => setOpen(false)}
                disabled={loading || saving || deleting}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Lista de materiales */}
                <div className="space-y-2 mb-6">
                  {materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay materiales guardados. Crea uno para empezar.
                    </p>
                  ) : (
                    materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground">
                            {mat.name}
                          </h4>
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            <p>Espesor: {mat.thickness} mm</p>
                            <p>Precio: €{mat.pricePerSquareMeter}/m²</p>
                            {mat.supplier && <p>Proveedor: {mat.supplier}</p>}
                          </div>
                        </div>
                        <Button
                          onClick={() => setDeleteId(mat.id)}
                          variant="destructive"
                          size="sm"
                          disabled={deleting}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario para agregar material */}
                {showForm ? (
                  <div className="border border-border rounded-lg p-4 space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium mb-1.5 block">
                          Nombre *
                        </Label>
                        <Input
                          placeholder="Ej: Cartón rígido 2mm"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={saving}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1.5 block">
                          Espesor (mm) *
                        </Label>
                        <Input
                          type="number"
                          placeholder="2.0"
                          value={formData.thickness}
                          onChange={(e) =>
                            setFormData({ ...formData, thickness: e.target.value })
                          }
                          disabled={saving}
                          step="0.1"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1.5 block">
                          Precio €/m² *
                        </Label>
                        <Input
                          type="number"
                          placeholder="5.00"
                          value={formData.pricePerSquareMeter}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerSquareMeter: e.target.value,
                            })
                          }
                          disabled={saving}
                          step="0.01"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1.5 block">
                          Proveedor
                        </Label>
                        <Input
                          placeholder="Ej: Proveedor X"
                          value={formData.supplier}
                          onChange={(e) =>
                            setFormData({ ...formData, supplier: e.target.value })
                          }
                          disabled={saving}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowForm(false);
                          setFormData({
                            name: "",
                            thickness: "",
                            pricePerSquareMeter: "",
                            supplier: "",
                          });
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddMaterial}
                        disabled={
                          !formData.name.trim() ||
                          !formData.thickness ||
                          !formData.pricePerSquareMeter ||
                          saving
                        }
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                    className="w-full gap-2 mb-4"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir material
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMaterial}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Eliminar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}