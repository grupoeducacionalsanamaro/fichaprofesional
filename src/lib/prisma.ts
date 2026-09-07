import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Instanciación perezosa: durante `next build` no siempre hay DATABASE_URL,
// y el cliente solo debe construirse cuando realmente se consulta la base.
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y complétala.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = createClient();
  }
  return globalForPrisma.__prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma(), prop, receiver);
  },
});
