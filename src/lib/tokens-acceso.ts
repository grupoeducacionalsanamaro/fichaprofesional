import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DIAS_VIGENCIA_VERIFICACION,
  HORAS_VIGENCIA_RECUPERACION,
  firmarTokenRecuperacion,
  firmarTokenVerificacion,
  verificarTokenRecuperacion,
  verificarTokenVerificacion,
} from "@/lib/tokens";
import { urlPublica } from "@/lib/email";

async function crearToken(alumnoId: string, proposito: "VERIFICAR_CORREO" | "RECUPERAR_CONTRASENA") {
  const horas = proposito === "VERIFICAR_CORREO" ? DIAS_VIGENCIA_VERIFICACION * 24 : HORAS_VIGENCIA_RECUPERACION;
  const expiraEn = new Date(Date.now() + horas * 60 * 60 * 1000);

  // Un token vigente por propósito y alumno: emitir uno nuevo invalida los anteriores.
  await prisma.tokenAcceso.updateMany({
    where: { alumnoId, proposito, usadoEn: null },
    data: { usadoEn: new Date() },
  });

  return prisma.tokenAcceso.create({
    data: { alumnoId, proposito, jti: crypto.randomUUID(), expiraEn },
  });
}

async function validarToken(token: string, proposito: "VERIFICAR_CORREO" | "RECUPERAR_CONTRASENA") {
  const payload =
    proposito === "VERIFICAR_CORREO"
      ? await verificarTokenVerificacion(token)
      : await verificarTokenRecuperacion(token);
  if (!payload) return null;

  const fila = await prisma.tokenAcceso.findUnique({ where: { jti: payload.jti } });
  if (!fila) return null;
  if (fila.alumnoId !== payload.sub) return null;
  if (fila.proposito !== proposito) return null;
  if (fila.usadoEn) return null;
  if (fila.expiraEn.getTime() < Date.now()) return null;

  return fila;
}

export async function crearEnlaceVerificacion(alumnoId: string) {
  const fila = await crearToken(alumnoId, "VERIFICAR_CORREO");
  const token = await firmarTokenVerificacion({ sub: alumnoId, jti: fila.jti });
  return urlPublica(`/verificar/${token}`);
}

export async function validarTokenVerificacion(token: string) {
  return validarToken(token, "VERIFICAR_CORREO");
}

export async function crearEnlaceRecuperacion(alumnoId: string) {
  const fila = await crearToken(alumnoId, "RECUPERAR_CONTRASENA");
  const token = await firmarTokenRecuperacion({ sub: alumnoId, jti: fila.jti });
  return urlPublica(`/recuperar/${token}`);
}

export async function validarTokenRecuperacion(token: string) {
  return validarToken(token, "RECUPERAR_CONTRASENA");
}

export async function marcarTokenUsado(id: string) {
  await prisma.tokenAcceso.update({ where: { id }, data: { usadoEn: new Date() } });
}
