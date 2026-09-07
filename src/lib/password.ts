import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt) as (
  contrasena: string,
  sal: Buffer,
  largo: number,
  opciones: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// Parámetros scrypt: coste 2^15, el mínimo recomendado por OWASP para r=8.
// scrypt viene en Node, así que no hace falta una dependencia nativa como bcrypt.
// maxmem explícito: el default de Node (32 MB) queda justo por debajo de lo
// que exige N=32768 con r=8, y scrypt falla con ERR_CRYPTO_INVALID_SCRYPT_PARAMS.
const COSTE = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
const LARGO = 64;

/**
 * Devuelve `scrypt.<sal hex>.<hash hex>`.
 *
 * El separador es un punto y no `$` a propósito: el cargador de .env de Next
 * expande `$algo` como si fuera una variable de entorno, y un hash con `$`
 * llega mutilado al proceso — un fallo silencioso que se manifiesta como
 * "contraseña incorrecta" con la contraseña correcta.
 */
export async function hashearContrasena(contrasena: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await derivar(contrasena.normalize("NFKC"), sal, LARGO, COSTE);
  return `scrypt.${sal.toString("hex")}.${hash.toString("hex")}`;
}

/**
 * Comparación en tiempo constante: una comparación normal filtra, por lo que
 * tarda, cuántos caracteres del hash coincidían.
 */
export async function verificarContrasena(
  contrasena: string,
  almacenado: string,
): Promise<boolean> {
  const [algoritmo, salHex, hashHex] = almacenado.split(".");
  if (algoritmo !== "scrypt" || !salHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, "hex");
  const obtenido = await derivar(
    contrasena.normalize("NFKC"),
    Buffer.from(salHex, "hex"),
    esperado.length,
    COSTE,
  );
  return timingSafeEqual(esperado, obtenido);
}

/**
 * Trabajo equivalente a una verificación real, para cuando el usuario no
 * existe: sin esto, un login fallido responde notoriamente más rápido y
 * permite averiguar qué correos tienen cuenta registrada.
 */
export async function gastarTiempoEquivalente(): Promise<void> {
  await derivar("contrasena-inexistente", randomBytes(16), LARGO, COSTE);
}
