import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "box_design_favorites";

export default function FavoritesManager({ dimensions, boxType, material, onLoad }) {
  const [favorites, setFavorites] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    }
  }, []);

  // Guardar favoritos al localStorage
  const saveFavorites = (updatedFavorites) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  };

  const isFilled = dimensions && boxType && material;

  const handleAddFavorite = () => {
    if (!isFilled) return;

    const name = prompt(
      "Nombre para este favorito:",
      `${boxType.name} ${dimensions.alto}×${dimensions.ancho}×${dimensions.profundidad}`
    );
    if (!name) return;

    const newFav = {
      id: Date.now(),
      name,
      dimensions,
      boxType,
      material,
      createdAt: new Date().toLocaleDateString("es-ES"),
    };

    saveFavorites([...favorites, newFav]);
  };

  const handleDeleteFavorite = (id) => {
    saveFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleLoadFavorite = (fav) => {
    onLoad({
      dimensions: fav.dimensions,
      boxType: fav.boxType,
      material: fav.material,
    });
    setExpanded(false);
  };

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Historial de Favoritos
          </h3>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
            {favorites.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <Button
            onClick={handleAddFavorite}
            disabled={!isFilled}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Star className="h-4 w-4 mr-2" />
            Guardar como Favorito
          </Button>

          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay favoritos guardados. Completa el diseño y guarda uno.
            </p>
          ) : (
            <div className="space-y-2">
              {favorites.map(fav => (
                <div
                  key={fav.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <button
                    onClick={() => handleLoadFavorite(fav)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {fav.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fav.dimensions.alto}×{fav.dimensions.ancho}×{fav.dimensions.profundidad} mm
                      • {fav.material.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Guardado: {fav.createdAt}
                    </p>
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 ml-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Eliminar favorito</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar "{fav.name}"?
                      </AlertDialogDescription>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFavorite(fav.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}