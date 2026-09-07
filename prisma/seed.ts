import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Duplica el algoritmo de src/lib/password.ts en vez de importarlo: ese
// módulo trae "server-only", que no resuelve al correr este script con tsx
// fuera del bundler de Next.
const derivar = promisify(scrypt) as (
  contrasena: string,
  sal: Buffer,
  largo: number,
  opciones: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

async function hashearContrasena(contrasena: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await derivar(contrasena.normalize("NFKC"), sal, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 96 * 1024 * 1024,
  });
  return `scrypt.${sal.toString("hex")}.${hash.toString("hex")}`;
}

// --- Fichas de DEMOSTRACIÓN ---
// Datos completamente ficticios. No corresponden a ninguna persona real.
// Sirven para revisar el flujo visual (publicada / borrador) sin usar datos
// de un alumno real. Bórralas antes de producción:
//   DELETE FROM "Alumno" WHERE "email" LIKE '%@demo.sanamaro.cl';
async function main() {
  const passwordHash = await hashearContrasena("demo-solo-para-pruebas");

  await prisma.alumno.upsert({
    where: { email: "demo.publicada@demo.sanamaro.cl" },
    update: {},
    create: {
      nombreCompleto: "Valentina Demo Ejemplo",
      email: "demo.publicada@demo.sanamaro.cl",
      emailVerificado: true,
      passwordHash,
      tituloProfesional: "Psicóloga clínica (DEMO)",
      numeroRegistroProfesional: "12345-6",
      whatsapp: "+56 9 1111 1111",
      direccionConsultorio: "Av. Providencia 1234, of. 56, Providencia",
      horariosAtencion: "Lunes a viernes, 9:00 a 18:00",
      bio: "Ficha de demostración con datos ficticios, creada para revisar el diseño del directorio.",
      redesSociales: [
        { plataforma: "Instagram", url: "https://instagram.com/demo" },
        { plataforma: "LinkedIn", url: "https://linkedin.com/in/demo" },
      ],
      estadoPublicacion: "PUBLICADA",
    },
  });

  await prisma.alumno.upsert({
    where: { email: "demo.borrador@demo.sanamaro.cl" },
    update: {},
    create: {
      nombreCompleto: "Matías Demo Ejemplo",
      email: "demo.borrador@demo.sanamaro.cl",
      passwordHash,
      tituloProfesional: "Kinesiólogo (DEMO)",
      estadoPublicacion: "BORRADOR",
    },
  });

  console.log("✔ 2 fichas DEMO sembradas (ficticias — ver comentario en prisma/seed.ts)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
