import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { firmarSesionAlumno, verificarSesionAlumno } from "@/lib/tokens";
import { gastarTiempoEquivalente, verificarContrasena } from "@/lib/password";

export const COOKIE_SESION = "sanamaro_alumnos_sesion";

/** Único punto que valida credenciales. Devuelve el id del alumno o null. */
export async function verificarCredenciales(
  correo: string,
  contrasena: string,
): Promise<string | null> {
  const normalizado = correo.trim().toLowerCase();
  const alumno = await prisma.alumno.findUnique({
    where: { email: normalizado },
    select: { id: true, passwordHash: true },
  });

  if (!alumno) {
    // Mismo costo que una verificación real: no delata qué correos existen.
    await gastarTiempoEquivalente();
    return null;
  }
  return (await verificarContrasena(contrasena, alumno.passwordHash)) ? alumno.id : null;
}

export async function iniciarSesion(alumnoId: string) {
  const token = await firmarSesionAlumno(alumnoId);
  const store = await cookies();
  store.set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.set(COOKIE_SESION, "", { path: "/", maxAge: 0 });
}

/** Devuelve el id del alumno autenticado, o null. Revalida que la cuenta exista en cada request. */
export async function sesionActual(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESION)?.value;
  if (!token) return null;
  const alumnoId = await verificarSesionAlumno(token);
  if (!alumnoId) return null;
  const existe = await prisma.alumno.findUnique({ where: { id: alumnoId }, select: { id: true } });
  return existe ? alumnoId : null;
}

/** Corta la ejecución si no hay sesión válida. Úsalo en toda página y acción del panel. */
export async function requerirAlumno(): Promise<string> {
  const alumnoId = await sesionActual();
  if (!alumnoId) redirect("/login");
  return alumnoId;
}
