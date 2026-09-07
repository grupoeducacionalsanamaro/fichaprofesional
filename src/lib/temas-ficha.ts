/**
 * Combinaciones de color para la ficha pública. Cada una son solo 2 colores:
 * `primario` (banda superior) y `acento` (línea, subrayados y detalles);
 * `boton` es una variante del primario para los botones de contacto, un poco
 * más clara para que se distinga de la banda al pasar el cursor.
 *
 * El id es lo único que se guarda en la base (`Profesional.temaFicha`): los
 * valores de color viven aquí, así que cambiar una paleta no exige migración.
 */
export const TEMAS_FICHA = [
  { id: "PETROLEO", nombre: "Petróleo", primario: "#0c3c45", boton: "#104e59", acento: "#bd8b45" },
  { id: "BURDEOS", nombre: "Burdeos", primario: "#3d1130", boton: "#5c1c49", acento: "#e0b15c" },
  { id: "MARINO", nombre: "Marino", primario: "#0d2038", boton: "#153355", acento: "#5fc9dd" },
  { id: "BOSQUE", nombre: "Bosque", primario: "#12281a", boton: "#1d4229", acento: "#d1a94f" },
  { id: "GRAFITO", nombre: "Grafito", primario: "#1c1f26", boton: "#2a2e37", acento: "#e2793f" },
  // Rosa vivo real (no vino): mismo tono que un rosa chicle/fucsia, con
  // suficiente saturación para leerse como "rosado" y no como "morado oscuro".
  // Contraste en verde-lima — cálido, sin ninguna nota azulada.
  { id: "ROSADO", nombre: "Rosado", primario: "#be185d", boton: "#db2777", acento: "#a3e635" },
] as const;

export type TemaFichaId = (typeof TEMAS_FICHA)[number]["id"];

export const TEMA_FICHA_IDS = TEMAS_FICHA.map((t) => t.id) as [TemaFichaId, ...TemaFichaId[]];

export function obtenerTemaFicha(id: string): (typeof TEMAS_FICHA)[number] {
  return TEMAS_FICHA.find((t) => t.id === id) ?? TEMAS_FICHA[0];
}
