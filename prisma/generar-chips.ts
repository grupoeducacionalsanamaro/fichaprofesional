/**
 * Genera un lote de códigos ChipNfc sin dueño y un CSV con la URL final
 * de cada uno, para entregarle a quien programe los llaveros NFC físicos.
 *
 * Uso: DATABASE_URL="<neon>" npx tsx prisma/generar-chips.ts <cantidad>
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const BASE_URL = process.env.APP_URL ?? "https://profesionales.sanamaro.cl";

// Duplicado a propósito: src/lib/chip-nfc.ts importa "server-only", que no
// resuelve fuera del bundler de Next (mismo motivo por el que seed.ts duplica
// el hash de contraseña en vez de importarlo).
const ALFABETO_CODIGO_CHIP = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LARGO_CODIGO_CHIP = 8;

function generarCodigoChip(): string {
  let codigo = "";
  for (let i = 0; i < LARGO_CODIGO_CHIP; i++) {
    codigo += ALFABETO_CODIGO_CHIP[randomInt(ALFABETO_CODIGO_CHIP.length)];
  }
  return codigo;
}

async function main() {
  const cantidad = Number(process.argv[2]);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    console.error("Uso: npx tsx prisma/generar-chips.ts <cantidad>");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const codigos: string[] = [];
  const vistos = new Set<string>();
  while (codigos.length < cantidad) {
    const codigo = generarCodigoChip();
    if (vistos.has(codigo)) continue; // colisión dentro del mismo lote, rarísimo
    vistos.add(codigo);
    codigos.push(codigo);
  }

  // createMany + skipDuplicates cubre la colisión (aún más rara) contra códigos
  // ya existentes en la base de otro lote generado antes.
  const resultado = await prisma.chipNfc.createMany({
    data: codigos.map((codigo) => ({ codigo })),
    skipDuplicates: true,
  });

  const filas = codigos.map((codigo) => `${codigo},${BASE_URL}/c/${codigo}`);
  const csv = ["codigo,url", ...filas].join("\n");
  const nombreArchivo = `chips-nfc-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(nombreArchivo, csv, "utf-8");

  console.log(`Insertados: ${resultado.count} de ${cantidad} solicitados.`);
  console.log(`Archivo generado: ${nombreArchivo}`);

  await prisma.$disconnect();
}

main();
