"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { iniciarSesion } from "@/lib/auth";
import { hashearContrasena } from "@/lib/password";
import { permitir } from "@/lib/rate-limit";
import { crearEnlaceVerificacion } from "@/lib/tokens-acceso";
import { enviarVerificacionCorreo } from "@/lib/email";
import { esquemaRegistro } from "@/lib/validaciones";

export type EstadoRegistro = {
  error?: string;
  valores?: { nombreCompleto?: string; email?: string };
};

export async function registrarCuenta(
  _previo: EstadoRegistro,
  formData: FormData,
): Promise<EstadoRegistro> {
  const valores = {
    nombreCompleto: String(formData.get("nombreCompleto") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const analisis = esquemaRegistro.safeParse({
    nombreCompleto: formData.get("nombreCompleto") ?? "",
    email: formData.get("email") ?? "",
    contrasena: formData.get("contrasena") ?? "",
    confirmarContrasena: formData.get("confirmarContrasena") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados.", valores };
  }
  const datos = analisis.data;

  const cabeceras = await headers();
  const ip = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  if (!permitir(`registro-ip:${ip}`, 8, 10 * 60_000)) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", valores };
  }

  const passwordHash = await hashearContrasena(datos.contrasena);

  let profesionalId: string;
  try {
    const profesional = await prisma.profesional.create({
      data: {
        nombreCompleto: datos.nombreCompleto,
        email: datos.email,
        passwordHash,
      },
      select: { id: true },
    });
    profesionalId = profesional.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe una cuenta con ese correo. Prueba iniciar sesión.", valores };
    }
    throw error;
  }

  const enlace = await crearEnlaceVerificacion(profesionalId);
  await enviarVerificacionCorreo({ para: datos.email, nombre: datos.nombreCompleto, enlace });

  await iniciarSesion(profesionalId);
  redirect("/panel");
}
