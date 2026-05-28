// Tipos de caja
export const BOX_TYPES = [
  {
    id: "estuche",
    name: "Estuche",
    description:
      "Caja cerrada con tapa integrada. Protege el libro por todos sus lados. Requiere 6 piezas: base, tapa, 2 laterales largos, 2 laterales cortos.",
    pieces: [
      { name: "Base", axis: "ancho x profundidad", qty: 1 },
      { name: "Tapa", axis: "ancho x profundidad", qty: 1 },
      { name: "Lateral largo", axis: "alto x profundidad", qty: 2 },
      { name: "Lateral corto", axis: "ancho x alto", qty: 2 },
    ],
  },
  {
    id: "carpeta",
    name: "Carpeta",
    description:
      "Estructura abierta con solapas. Envuelve el libro sin cerrarlo completamente. Requiere 3 piezas: plano central, 2 solapas laterales.",
    pieces: [
      { name: "Plano central", axis: "ancho x alto", qty: 1 },
      { name: "Solapa lateral", axis: "profundidad x alto", qty: 2 },
    ],
  },
  {
    id: "tapa",
    name: "Caja con tapa",
    description:
      "Caja base separada de su tapa. Permite acceso vertical al libro. Requiere 10 piezas: base inferior, 4 laterales de base, tapa superior, 4 laterales de tapa.",
    pieces: [
      { name: "Base inferior", axis: "ancho x profundidad", qty: 1 },
      { name: "Lateral largo (base)", axis: "ancho x alto/2", qty: 2 },
      { name: "Lateral corto (base)", axis: "profundidad x alto/2", qty: 2 },
      { name: "Tapa superior", axis: "ancho x profundidad", qty: 1 },
      { name: "Lateral largo (tapa)", axis: "ancho x alto/2", qty: 2 },
      { name: "Lateral corto (tapa)", axis: "profundidad x alto/2", qty: 2 },
    ],
  },
];

// Materiales disponibles
export const MATERIALS = [
  { id: "carton_rigido", name: "Cartón Rígido", thickness: 2.0 },
  { id: "carton_pluma", name: "Cartón Pluma", thickness: 5.0 },
  { id: "craft", name: "Craft", thickness: 0.5 },
  { id: "balsa", name: "Madera Balsa", thickness: 3.0 },
];

// Margen estándar en mm
const MARGIN = 2;

/**
 * Fórmula: Medida Pieza = (Dimensión Libro + 2mm margen) + (2 × Grosor Material)
 */
function applyFormula(dimension, thickness) {
  return dimension + MARGIN + 2 * thickness;
}

/**
 * Calcula todas las piezas para un tipo de caja, dimensiones de libro y material.
 */
export function calculatePieces(bookDimensions, boxType, material) {
  const { alto, ancho, profundidad } = bookDimensions;
  const t = material.thickness;
  const needsAngleCut = t > 3;

  const dimMap = {
    alto: applyFormula(alto, t),
    ancho: applyFormula(ancho, t),
    profundidad: applyFormula(profundidad, t),
    "alto/2": applyFormula(alto / 2, t),
  };

  const pieces = boxType.pieces.map((piece) => {
    const [dimA, dimB] = piece.axis.split(" x ");
    const measureA = dimMap[dimA];
    const measureB = dimMap[dimB];

    return {
      name: piece.name,
      description: `${dimA} × ${dimB}`,
      qty: piece.qty,
      measureA: parseFloat(measureA.toFixed(1)),
      measureB: parseFloat(measureB.toFixed(1)),
      finalMeasure: `${measureA.toFixed(1)} × ${measureB.toFixed(1)} mm`,
    };
  });

  return { pieces, needsAngleCut };
}

/**
 * Genera instrucciones de montaje según el tipo de caja.
 */
export function getInstructions(boxType, material) {
  const needsAngleCut = material.thickness > 3;

  const base = [
    `Cortar todas las piezas según las medidas indicadas en la tabla, usando ${material.name} de ${material.thickness} mm.`,
  ];

  if (needsAngleCut) {
    base.push(
      `ALERTA: El grosor del material (${material.thickness} mm) supera los 3 mm. Realizar cortes a 45° en todas las aristas de unión para un ensamble limpio.`
    );
  }

  const typeInstructions = {
    estuche: [
      "Pegar los 2 laterales largos a la base, alineando los bordes exteriores.",
      "Pegar los 2 laterales cortos entre los laterales largos, formando la caja.",
      "Verificar escuadra con una regla en L antes de que el adhesivo seque.",
      "Colocar la tapa sobre la estructura. Ajustar si es necesario.",
      "Dejar secar bajo peso uniforme durante mínimo 2 horas.",
    ],
    carpeta: [
      "Colocar el plano central sobre una superficie plana.",
      "Marcar las líneas de pliegue a la distancia del grosor del libro + margen.",
      "Pegar las solapas laterales alineadas con las marcas de pliegue.",
      "Plegar las solapas hacia adentro para verificar el ajuste.",
      "Dejar secar bajo peso uniforme durante mínimo 1 hora.",
    ],
    tapa: [
      "Construir la base: pegar los 4 laterales de base a la pieza inferior.",
      "Verificar escuadra de la base con una regla en L.",
      "Construir la tapa: pegar los 4 laterales de tapa a la pieza superior.",
      "La tapa debe encajar sobre la base con un deslizamiento suave.",
      "Si la tapa queda ajustada, lijar 0.5 mm en los laterales de tapa.",
      "Dejar secar ambas partes bajo peso uniforme durante mínimo 2 horas.",
    ],
  };

  return [...base, ...typeInstructions[boxType.id]];
}