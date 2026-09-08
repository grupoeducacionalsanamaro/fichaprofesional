import { notFound, redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { buscarChipPorCodigo, normalizarCodigoChip } from "@/lib/chip-nfc";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/**
 * Punto de entrada de los llaveros NFC físicos. Nunca renderiza nada por sí
 * misma: solo decide a dónde redirigir según el estado del chip.
 * Ver [[project_alumnos_directorio]] — chip sin dueño → activar cuenta;
 * chip reclamado → directo a la ficha pública, sin pasar por el panel.
 */
export default async function ChipNfcPagina({ params }: PageProps<"/c/[codigo]">) {
  const { codigo } = await params;
  const normalizado = normalizarCodigoChip(codigo);
  if (!normalizado) notFound();

  const chip = await buscarChipPorCodigo(normalizado);
  if (!chip) notFound();

  if (chip.profesionalId) {
    redirect(`/ficha/${chip.profesionalId}`);
  }

  const sesion = await sesionActual();
  if (sesion) {
    redirect(`/panel/cuenta?chip=${normalizado}`);
  }
  redirect(`/registro?chip=${normalizado}`);
}
