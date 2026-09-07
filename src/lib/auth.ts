import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { firmarSesionProfesional, verificarSesionProfesional } from "@/lib/tokens";
import { gastarTiempoEquivalente, verificarContrasena } from "@/lib/password";

export const COOKIE_SESION = "sanamaro_profesionales_sesion";

/** Único punto que valida credenciales. Devuelve el id del profesional o null. */
export async function verificarCredenciales(
  correo: string,
  contrasena: string,
): Promise<string | null> {
  const normalizado = correo.trim().toLowerCase();
  const profesional = await prisma.profesional.findUnique({
    where: { email: normalizado },
    select: { id: true, passwordHash: true },
  });

  if (!profesional) {
    // Mismo costo que una verificación real: no delata qué correos existen.
    await gastarTiempoEquivalente();
    return null;
  }
  return (await verificarContrasena(contrasena, profesional.passwordHash)) ? profesional.id : null;
}

export async function iniciarSesion(profesionalId: string) {
  const token = await firmarSesionProfesional(profesionalId);
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

/** Devuelve el id del profesional autenticado, o null. Revalida que la cuenta exista en cada request. */
export async function sesionActual(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESION)?.value;
  if (!token) return null;
  const profesionalId = await verificarSesionProfesional(token);
  if (!profesionalId) return null;
  const existe = await prisma.profesional.findUnique({ where: { id: profesionalId }, select: { id: true } });
  return existe ? profesionalId : null;
}

/** Corta la ejecución si no hay sesión válida. Úsalo en toda página y acción del panel. */
export async function requerirProfesional(): Promise<string> {
  const profesionalId = await sesionActual();
  if (!profesionalId) redirect("/login");
  return profesionalId;
}
