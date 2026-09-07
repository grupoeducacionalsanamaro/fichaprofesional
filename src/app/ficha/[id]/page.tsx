import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TarjetaFicha } from "@/components/ficha";
import { Cabecera, Contenido, PieDePagina } from "@/components/marco";
import { obtenerFichaPublica } from "@/lib/datos-publicos";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/ficha/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ficha = await obtenerFichaPublica(id);
  if (!ficha) return { title: "Ficha no disponible" };
  return {
    title: ficha.nombreCompleto,
    description: `${ficha.tituloProfesional} — Directorio de Profesionales, Grupo San Amaro`,
  };
}

export default async function FichaPublicaPagina({ params }: PageProps<"/ficha/[id]">) {
  const { id } = await params;
  const ficha = await obtenerFichaPublica(id);

  // Ficha inexistente y ficha no publicada devuelven exactamente lo mismo:
  // no se revela el estado real del registro.
  if (!ficha) notFound();

  return (
    <>
      <Cabecera enlaceVolver />
      {/* La ficha individual se mantiene del ancho de una credencial, incluso
          en escritorio: es una tarjeta, no una página. */}
      <Contenido className="max-w-lg">
        <TarjetaFicha ficha={ficha} />
      </Contenido>
      <PieDePagina />
    </>
  );
}
