/**
 * Rate limit básico en memoria, por IP y ventana deslizante.
 *
 * Limitación conocida y aceptada: en Vercel cada instancia serverless tiene su
 * propia memoria, así que el límite es por instancia y se pierde en frío. Sirve
 * para frenar cosecha automatizada desde una IP, no como control estricto.
 * Si más adelante hace falta algo firme, reemplazar por Upstash Redis / Vercel KV.
 */
type Registro = { conteo: number; reinicioEn: number };

const ventanas = new Map<string, Registro>();
const MAXIMO_CLAVES = 5000;

export function permitir(clave: string, limite: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const actual = ventanas.get(clave);

  if (!actual || actual.reinicioEn <= ahora) {
    if (ventanas.size > MAXIMO_CLAVES) {
      for (const [k, v] of ventanas) if (v.reinicioEn <= ahora) ventanas.delete(k);
    }
    ventanas.set(clave, { conteo: 1, reinicioEn: ahora + ventanaMs });
    return true;
  }

  if (actual.conteo >= limite) return false;
  actual.conteo += 1;
  return true;
}
