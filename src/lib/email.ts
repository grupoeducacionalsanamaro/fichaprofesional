import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Directorio de Profesionales San Amaro <onboarding@resend.dev>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "administracion@sanamaro.cl";

/** URL pública completa de la app. */
export function urlPublica(ruta: string) {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${ruta}`;
}

async function enviar(opciones: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Sin API key (desarrollo local): el enlace queda en el log del servidor
    // para poder recorrer el flujo completo sin proveedor de correo.
    console.warn(
      `[email:simulado] Para: ${opciones.to}\nAsunto: ${opciones.subject}\n${opciones.text}`,
    );
    return { simulado: true as const };
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to: opciones.to,
    replyTo: REPLY_TO,
    subject: opciones.subject,
    html: opciones.html,
    text: opciones.text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
  return { simulado: false as const };
}

/** El nombre del profesional viaja sin escapar hasta acá; nunca insertarlo en HTML sin pasar por esto. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const marco = (titulo: string, cuerpo: string) => `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#f4f5f7;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <p style="margin:0 0 24px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;font-weight:600">Directorio de Profesionales — Grupo San Amaro</p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827">${titulo}</h1>
    ${cuerpo}
  </div>
</div>`;

const boton = (href: string, texto: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">${texto}</a></p>
   <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all">Si el botón no funciona, copia este enlace:<br>${href}</p>`;

export async function enviarVerificacionCorreo(params: { para: string; nombre: string; enlace: string }) {
  const titulo = "Confirma tu correo";
  const intro =
    "Gracias por crear tu ficha en el Directorio de Profesionales. Confirma tu correo para poder publicarla. El enlace vence en 3 días.";
  return enviar({
    to: params.para,
    subject: `${titulo} — Directorio de Profesionales`,
    text: `Hola ${params.nombre},\n\n${intro}\n\n${params.enlace}`,
    html: marco(
      titulo,
      `<p style="margin:0;color:#374151;line-height:1.6">Hola ${escaparHtml(params.nombre)}, ${intro}</p>${boton(params.enlace, "Confirmar mi correo")}`,
    ),
  });
}

export async function enviarRecuperacionContrasena(params: { para: string; nombre: string; enlace: string }) {
  const titulo = "Recupera tu contraseña";
  const intro =
    "Pediste restablecer la contraseña de tu cuenta del Directorio de Profesionales. El enlace vence en 2 horas y solo puede usarse una vez.";
  const cierre = "Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.";
  return enviar({
    to: params.para,
    subject: `${titulo} — Directorio de Profesionales`,
    text: `Hola ${params.nombre},\n\n${intro}\n\n${params.enlace}\n\n${cierre}`,
    html: marco(
      titulo,
      `<p style="margin:0;color:#374151;line-height:1.6">Hola ${escaparHtml(params.nombre)}, ${intro}</p>${boton(params.enlace, "Elegir nueva contraseña")}<p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6">${cierre}</p>`,
    ),
  });
}
