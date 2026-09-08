import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

/** Sin 0/O, 1/I/L: evita confusiones al escribir el código a mano. */
const ALFABETO_CODIGO_CHIP = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const LARGO_CODIGO_CHIP = 8;

export function generarCodigoChip(): string {
  let codigo = "";
  for (let i = 0; i < LARGO_CODIGO_CHIP; i++) {
    codigo += ALFABETO_CODIGO_CHIP[randomInt(ALFABETO_CODIGO_CHIP.length)];
  }
  return codigo;
}

/** Acepta minúsculas, espacios o guiones (p. ej. "k7qx-2mrt") y los normaliza a la forma canónica. */
export function normalizarCodigoChip(valor: string): string | null {
  const limpio = valor
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (limpio.length !== LARGO_CODIGO_CHIP) return null;
  return limpio;
}

export async function buscarChipPorCodigo(codigo: string) {
  return prisma.chipNfc.findUnique({
    where: { codigo },
    select: { codigo: true, profesionalId: true },
  });
}

/** Reclama un chip sin dueño para un profesional. Atómico: si otra reclamación ganó la carrera, devuelve false. */
export async function reclamarChip(codigoCrudo: string, profesionalId: string): Promise<boolean> {
  const codigo = normalizarCodigoChip(codigoCrudo);
  if (!codigo) return false;

  const resultado = await prisma.chipNfc.updateMany({
    where: { codigo, profesionalId: null },
    data: { profesionalId, reclamadoEn: new Date() },
  });
  return resultado.count > 0;
}
