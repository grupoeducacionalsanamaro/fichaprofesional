"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requerirProfesional, cerrarSesion } from "@/lib/auth";
import { hashearContrasena, verificarContrasena } from "@/lib/password";
import { crearEnlaceVerificacion } from "@/lib/tokens-acceso";
import { enviarVerificacionCorreo } from "@/lib/email";
import { esquemaCambiarContrasena, esquemaEliminarCuenta } from "@/lib/validaciones";
import { blobConfigurado } from "@/lib/blob";

export async function reenviarVerificacion() {
  const profesionalId = await requerirProfesional();
  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { email: true, nombreCompleto: true, emailVerificado: true },
  });
  if (profesional.emailVerificado) return;

  const enlace = await crearEnlaceVerificacion(profesionalId);
  await enviarVerificacionCorreo({ para: profesional.email, nombre: profesional.nombreCompleto, enlace });
}

export type EstadoContrasena = { error?: string; guardado?: boolean };

export async function cambiarContrasena(
  _previo: EstadoContrasena,
  formData: FormData,
): Promise<EstadoContrasena> {
  const profesionalId = await requerirProfesional();

  const analisis = esquemaCambiarContrasena.safeParse({
    contrasenaActual: formData.get("contrasenaActual") ?? "",
    contrasena: formData.get("contrasena") ?? "",
    confirmarContrasena: formData.get("confirmarContrasena") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { passwordHash: true },
  });
  const correcta = await verificarContrasena(analisis.data.contrasenaActual, profesional.passwordHash);
  if (!correcta) {
    return { error: "Tu contraseña actual no es correcta." };
  }

  const passwordHash = await hashearContrasena(analisis.data.contrasena);
  await prisma.profesional.update({ where: { id: profesionalId }, data: { passwordHash } });

  return { guardado: true };
}

export type EstadoEliminar = { error?: string };

export async function eliminarCuenta(
  _previo: EstadoEliminar,
  formData: FormData,
): Promise<EstadoEliminar> {
  const profesionalId = await requerirProfesional();

  const analisis = esquemaEliminarCuenta.safeParse({
    confirmacion: formData.get("confirmacion") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Escribe ELIMINAR para confirmar." };
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { fotoUrl: true },
  });

  await prisma.profesional.delete({ where: { id: profesionalId } });

  if (profesional.fotoUrl && blobConfigurado()) {
    // La cuenta ya se borró; que falle el borrado de la foto no debe impedir
    // salir de la sesión de una cuenta que ya no existe.
    await del(profesional.fotoUrl).catch(() => {});
  }

  await cerrarSesion();
  revalidatePath("/");
  redirect("/");
}
