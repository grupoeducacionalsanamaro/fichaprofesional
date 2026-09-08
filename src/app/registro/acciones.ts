"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { iniciarSesion } from "@/lib/auth";
import { normalizarCodigoChip } from "@/lib/chip-nfc";
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

  // El registro es solo por invitación (llavero NFC): sin un código válido y
  // sin reclamar, no se crea la cuenta bajo ninguna circunstancia, aunque se
  // llame a esta acción directamente saltándose la pantalla de /registro.
  const codigoChip = normalizarCodigoChip(String(formData.get("chip") ?? ""));
  if (!codigoChip) {
    return { error: "El registro es solo por invitación. Necesitas el código de tu llavero NFC.", valores };
  }

  const passwordHash = await hashearContrasena(datos.contrasena);

  let profesionalId: string;
  try {
    profesionalId = await prisma.$transaction(async (tx) => {
      const profesional = await tx.profesional.create({
        data: {
          nombreCompleto: datos.nombreCompleto,
          email: datos.email,
          passwordHash,
        },
        select: { id: true },
      });

      const reclamo = await tx.chipNfc.updateMany({
        where: { codigo: codigoChip, profesionalId: null },
        data: { profesionalId: profesional.id, reclamadoEn: new Date() },
      });
      if (reclamo.count === 0) {
        throw new Error("CODIGO_CHIP_INVALIDO");
      }

      return profesional.id;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe una cuenta con ese correo. Prueba iniciar sesión.", valores };
    }
    if (error instanceof Error && error.message === "CODIGO_CHIP_INVALIDO") {
      return { error: "Ese código de llavero no es válido o ya fue utilizado.", valores };
    }
    throw error;
  }

  const enlace = await crearEnlaceVerificacion(profesionalId);
  await enviarVerificacionCorreo({ para: datos.email, nombre: datos.nombreCompleto, enlace });

  await iniciarSesion(profesionalId);
  redirect("/panel");
}
