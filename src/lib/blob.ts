/**
 * Vercel Blob se puede autenticar de dos formas, y el código no debe asumir
 * cuál está activa:
 *
 * - Token estático `BLOB_READ_WRITE_TOKEN` (flujo clásico, típico en local).
 * - OIDC automático: al conectar el store desde el dashboard con "Connect
 *   Project", Vercel entrega `BLOB_STORE_ID` (+ `BLOB_WEBHOOK_PUBLIC_KEY` para
 *   webhooks) y firma cada request en runtime sin exponer ningún secreto —
 *   `put()`/`del()` lo hacen solos, sin pasarles token.
 *
 * Si solo se comprobara `BLOB_READ_WRITE_TOKEN`, un store conectado por OIDC
 * parecería "no configurado" y la subida de fotos quedaría bloqueada sin motivo.
 */
export function blobConfigurado(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}
