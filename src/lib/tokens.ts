import "server-only";
import { SignJWT, jwtVerify } from "jose";

const ISSUER = "sanamaro-profesionales";

function secret(nombre: "TOKEN_SECRET" | "SESSION_SECRET") {
  const valor = process.env[nombre];
  if (!valor || valor.length < 32) {
    throw new Error(`Falta ${nombre} o tiene menos de 32 caracteres.`);
  }
  return new TextEncoder().encode(valor);
}

export type PayloadAcceso = {
  /** id del Profesional al que pertenece el token */
  sub: string;
  /** id de la fila TokenAcceso — permite invalidarlo tras su primer uso */
  jti: string;
};

export const DIAS_VIGENCIA_VERIFICACION = 3;
export const HORAS_VIGENCIA_RECUPERACION = 2;

async function firmarToken(payload: PayloadAcceso, audiencia: string, vigencia: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(audiencia)
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(vigencia)
    .sign(secret("TOKEN_SECRET"));
}

async function verificarToken(token: string, audiencia: string): Promise<PayloadAcceso | null> {
  try {
    const { payload } = await jwtVerify(token, secret("TOKEN_SECRET"), {
      issuer: ISSUER,
      audience: audiencia,
    });
    if (!payload.sub || !payload.jti) return null;
    return { sub: payload.sub, jti: payload.jti };
  } catch {
    return null;
  }
}

export const firmarTokenVerificacion = (payload: PayloadAcceso) =>
  firmarToken(payload, "verificar-correo", `${DIAS_VIGENCIA_VERIFICACION}d`);
export const verificarTokenVerificacion = (token: string) =>
  verificarToken(token, "verificar-correo");

export const firmarTokenRecuperacion = (payload: PayloadAcceso) =>
  firmarToken(payload, "recuperar-contrasena", `${HORAS_VIGENCIA_RECUPERACION}h`);
export const verificarTokenRecuperacion = (token: string) =>
  verificarToken(token, "recuperar-contrasena");

/** Cookie de sesión del profesional. Vigencia: 30 días. */
export async function firmarSesionProfesional(profesionalId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience("profesional-session")
    .setSubject(profesionalId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret("SESSION_SECRET"));
}

export async function verificarSesionProfesional(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret("SESSION_SECRET"), {
      issuer: ISSUER,
      audience: "profesional-session",
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
