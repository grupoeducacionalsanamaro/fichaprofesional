import { z } from "zod";
import { TEMA_FICHA_IDS } from "@/lib/temas-ficha";

/**
 * Campo opcional: acepta texto de formulario ("" → null) y también null, porque
 * este mismo esquema revalida datos ya guardados.
 */
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable();

/** Igual que `textoOpcional`, pero valida formato de correo cuando no está vacío. */
const correoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .refine((v) => v === null || z.email().safeParse(v).success, {
      message: "Correo de contacto inválido.",
    });

const CONTRASENA_MINIMA = 8;

export const esquemaRegistro = z
  .object({
    nombreCompleto: z.string().trim().min(3, "Ingresa tu nombre completo.").max(160),
    email: z.email("Correo inválido.").trim().toLowerCase(),
    contrasena: z
      .string()
      .min(CONTRASENA_MINIMA, `La contraseña debe tener al menos ${CONTRASENA_MINIMA} caracteres.`)
      .max(200),
    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarContrasena"],
  });

export const esquemaAcceso = z.object({
  email: z.string().trim().toLowerCase().min(1, "Ingresa tu correo."),
  contrasena: z.string().min(1, "Ingresa tu contraseña."),
});

export const esquemaSolicitarRecuperacion = z.object({
  email: z.email("Correo inválido.").trim().toLowerCase(),
});

export const esquemaNuevaContrasena = z
  .object({
    contrasena: z
      .string()
      .min(CONTRASENA_MINIMA, `La contraseña debe tener al menos ${CONTRASENA_MINIMA} caracteres.`)
      .max(200),
    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarContrasena"],
  });

export const esquemaCambiarContrasena = z
  .object({
    contrasenaActual: z.string().min(1, "Ingresa tu contraseña actual."),
    contrasena: z
      .string()
      .min(CONTRASENA_MINIMA, `La contraseña debe tener al menos ${CONTRASENA_MINIMA} caracteres.`)
      .max(200),
    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: "Las contraseñas nuevas no coinciden.",
    path: ["confirmarContrasena"],
  });

/** Un enlace por red social: etiqueta libre + URL. */
export const esquemaRedSocial = z.object({
  plataforma: z.string().trim().min(1).max(40),
  url: z.url("Enlace inválido."),
});

/** Datos de la ficha profesional que el propio profesional edita. */
export const esquemaFicha = z.object({
  nombreCompleto: z.string().trim().min(3, "Ingresa tu nombre completo.").max(160),
  tituloProfesional: z.string().trim().min(2, "Indica tu título profesional.").max(120),
  especializacion: textoOpcional(120),
  numeroRegistroProfesional: textoOpcional(60),
  whatsapp: textoOpcional(40),
  correoContacto: correoOpcional(160),
  direccionConsultorio: textoOpcional(200),
  horariosAtencion: textoOpcional(200),
  bio: textoOpcional(600),
  redesSociales: z.array(esquemaRedSocial).max(8).default([]),
  fotoUrl: textoOpcional(600),
  temaFicha: z.enum(TEMA_FICHA_IDS).catch("PETROLEO"),
});

export type DatosFicha = z.infer<typeof esquemaFicha>;

export const esquemaEliminarCuenta = z.object({
  confirmacion: z.literal("ELIMINAR", {
    message: 'Escribe ELIMINAR en mayúsculas para confirmar.',
  }),
});

export const MAX_FOTO_BYTES = 4 * 1024 * 1024;
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
