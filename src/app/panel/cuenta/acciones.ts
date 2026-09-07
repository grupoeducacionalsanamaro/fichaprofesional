"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requerirAlumno, cerrarSesion } from "@/lib/auth";
import { hashearContrasena, verificarContrasena } from "@/lib/password";
import { crearEnlaceVerificacion } from "@/lib/tokens-acceso";
import { enviarVerificacionCorreo } from "@/lib/email";
import { esquemaCambiarContrasena, esquemaEliminarCuenta } from "@/lib/validaciones";
import { blobConfigurado } from "@/lib/blob";

export async function reenviarVerificacion() {
  const alumnoId = await requerirAlumno();
  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: { email: true, nombreCompleto: true, emailVerificado: true },
  });
  if (alumno.emailVerificado) return;

  const enlace = await crearEnlaceVerificacion(alumnoId);
  await enviarVerificacionCorreo({ para: alumno.email, nombre: alumno.nombreCompleto, enlace });
}

export type EstadoContrasena = { error?: string; guardado?: boolean };

export async function cambiarContrasena(
  _previo: EstadoContrasena,
  formData: FormData,
): Promise<EstadoContrasena> {
  const alumnoId = await requerirAlumno();

  const analisis = esquemaCambiarContrasena.safeParse({
    contrasenaActual: formData.get("contrasenaActual") ?? "",
    contrasena: formData.get("contrasena") ?? "",
    confirmarContrasena: formData.get("confirmarContrasena") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: { passwordHash: true },
  });
  const correcta = await verificarContrasena(analisis.data.contrasenaActual, alumno.passwordHash);
  if (!correcta) {
    return { error: "Tu contraseña actual no es correcta." };
  }

  const passwordHash = await hashearContrasena(analisis.data.contrasena);
  await prisma.alumno.update({ where: { id: alumnoId }, data: { passwordHash } });

  return { guardado: true };
}

export type EstadoEliminar = { error?: string };

export async function eliminarCuenta(
  _previo: EstadoEliminar,
  formData: FormData,
): Promise<EstadoEliminar> {
  const alumnoId = await requerirAlumno();

  const analisis = esquemaEliminarCuenta.safeParse({
    confirmacion: formData.get("confirmacion") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Escribe ELIMINAR para confirmar." };
  }

  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: { fotoUrl: true },
  });

  await prisma.alumno.delete({ where: { id: alumnoId } });

  if (alumno.fotoUrl && blobConfigurado()) {
    // La cuenta ya se borró; que falle el borrado de la foto no debe impedir
    // salir de la sesión de una cuenta que ya no existe.
    await del(alumno.fotoUrl).catch(() => {});
  }

  await cerrarSesion();
  revalidatePath("/");
  redirect("/");
}
