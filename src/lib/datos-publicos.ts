import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Esta es la ÚNICA forma en que la capa pública toca la base. El `select` es
 * explícito y positivo — nunca traigas la fila completa y ocultes campos en
 * el render.
 *
 * Campos deliberadamente ausentes: `email` (correo de acceso a la cuenta —
 * nunca se muestra en público; el botón de contacto usa `correoContacto`,
 * que el profesional decide si completa o no), `passwordHash`, `emailVerificado`,
 * `estadoPublicacion`.
 */
export const SELECT_PUBLICO = {
  id: true,
  nombreCompleto: true,
  fotoUrl: true,
  tituloProfesional: true,
  especializacion: true,
  numeroRegistroProfesional: true,
  whatsapp: true,
  correoContacto: true,
  direccionConsultorio: true,
  horariosAtencion: true,
  bio: true,
  redesSociales: true,
  temaFicha: true,
} as const;

export type RedSocial = { plataforma: string; url: string };
export type FichaPublica = NonNullable<Awaited<ReturnType<typeof obtenerFichaPublica>>>;

/**
 * Única forma de leer una ficha pública: por su id exacto. No existe un
 * listado ni una búsqueda — cada ficha se comparte por enlace directo, no se
 * navega desde un directorio público.
 */
export async function obtenerFichaPublica(id: string) {
  return prisma.profesional.findFirst({
    where: { id, estadoPublicacion: "PUBLICADA" },
    select: SELECT_PUBLICO,
  });
}
