"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { requerirProfesional } from "@/lib/auth";
import { esquemaFicha, MAX_FOTO_BYTES, TIPOS_FOTO } from "@/lib/validaciones";
import type { Prisma } from "@/generated/prisma/client";

export type EstadoFicha = {
  error?: string;
  guardado?: boolean;
  /** true cuando este envío incluyó una foto nueva y quedó subida. */
  fotoActualizada?: boolean;
  /** Valores reenviados al formulario: React 19 resetea los campos tras cada acción. */
  valores?: Record<string, string>;
};

const CAMPOS_TEXTO = [
  "nombreCompleto",
  "tituloProfesional",
  "especializacion",
  "numeroRegistroProfesional",
  "whatsapp",
  "correoContacto",
  "direccionConsultorio",
  "horariosAtencion",
  "bio",
  "temaFicha",
] as const;

function recuperarValores(formData: FormData) {
  return Object.fromEntries(CAMPOS_TEXTO.map((c) => [c, String(formData.get(c) ?? "")]));
}

function leerRedesSociales(formData: FormData) {
  const plataformas = formData.getAll("redPlataforma").map(String);
  const urls = formData.getAll("redUrl").map(String);
  return plataformas
    .map((plataforma, i) => ({ plataforma: plataforma.trim(), url: (urls[i] ?? "").trim() }))
    .filter((r) => r.plataforma && r.url);
}

export async function guardarFicha(_previo: EstadoFicha, formData: FormData): Promise<EstadoFicha> {
  const profesionalId = await requerirProfesional();
  const valores = recuperarValores(formData);

  const actual = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { fotoUrl: true },
  });

  const analisis = esquemaFicha.safeParse({
    nombreCompleto: formData.get("nombreCompleto") ?? "",
    tituloProfesional: formData.get("tituloProfesional") ?? "",
    especializacion: formData.get("especializacion") ?? "",
    numeroRegistroProfesional: formData.get("numeroRegistroProfesional") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    correoContacto: formData.get("correoContacto") ?? "",
    direccionConsultorio: formData.get("direccionConsultorio") ?? "",
    horariosAtencion: formData.get("horariosAtencion") ?? "",
    bio: formData.get("bio") ?? "",
    redesSociales: leerRedesSociales(formData),
    fotoUrl: actual.fotoUrl ?? "",
    temaFicha: formData.get("temaFicha") ?? "PETROLEO",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados.", valores };
  }
  const datos = analisis.data;

  const foto = formData.get("foto");
  let fotoActualizada = false;
  if (foto instanceof File && foto.size > 0) {
    if (!TIPOS_FOTO.includes(foto.type)) {
      return { error: "La foto debe ser JPG, PNG o WEBP.", valores };
    }
    if (foto.size > MAX_FOTO_BYTES) {
      return { error: "La foto no puede superar 4 MB.", valores };
    }
    if (!blobConfigurado()) {
      return { error: "La carga de fotos no está configurada todavía.", valores };
    }
    const extension = foto.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const subida = await put(`profesionales/${profesionalId}.${extension}`, foto, {
      access: "public",
      addRandomSuffix: true,
      contentType: foto.type,
    });
    datos.fotoUrl = subida.url;
    fotoActualizada = true;
  }

  await prisma.profesional.update({
    where: { id: profesionalId },
    data: {
      nombreCompleto: datos.nombreCompleto,
      tituloProfesional: datos.tituloProfesional,
      especializacion: datos.especializacion,
      numeroRegistroProfesional: datos.numeroRegistroProfesional,
      whatsapp: datos.whatsapp,
      correoContacto: datos.correoContacto,
      direccionConsultorio: datos.direccionConsultorio,
      horariosAtencion: datos.horariosAtencion,
      bio: datos.bio,
      redesSociales: datos.redesSociales as unknown as Prisma.InputJsonValue,
      fotoUrl: datos.fotoUrl,
      temaFicha: datos.temaFicha,
    },
  });

  revalidatePath("/panel");
  revalidatePath(`/ficha/${profesionalId}`);
  revalidatePath("/");
  return { guardado: true, fotoActualizada };
}

export async function alternarPublicacion() {
  const profesionalId = await requerirProfesional();
  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { estadoPublicacion: true, emailVerificado: true, nombreCompleto: true, tituloProfesional: true },
  });

  if (profesional.estadoPublicacion === "PUBLICADA") {
    await prisma.profesional.update({ where: { id: profesionalId }, data: { estadoPublicacion: "BORRADOR" } });
  } else if (profesional.emailVerificado && profesional.nombreCompleto.trim() && profesional.tituloProfesional.trim()) {
    // Revalidado en el servidor: los controles del formulario son solo ayuda visual.
    await prisma.profesional.update({ where: { id: profesionalId }, data: { estadoPublicacion: "PUBLICADA" } });
  }

  revalidatePath("/panel");
  revalidatePath(`/ficha/${profesionalId}`);
  revalidatePath("/");
}
