import Image from "next/image";
import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { buscarChipPorCodigo, normalizarCodigoChip } from "@/lib/chip-nfc";
import { Cabecera, Contenido } from "@/components/marco";
import { FormularioRegistro } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crea tu ficha", robots: { index: false, follow: false } };

export default async function Registro({ searchParams }: PageProps<"/registro">) {
  if (await sesionActual()) redirect("/panel");

  const { chip } = await searchParams;
  let chipCodigo: string | null = null;
  if (typeof chip === "string") {
    const normalizado = normalizarCodigoChip(chip);
    if (normalizado) {
      const fila = await buscarChipPorCodigo(normalizado);
      if (fila && !fila.profesionalId) chipCodigo = normalizado;
    }
  }

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <Image src="/logo.png" alt="" aria-hidden width={56} height={56} className="mx-auto mb-4 h-14 w-14" />
        <h1 className="text-center text-[1.65rem] font-bold tracking-tight">Crea tu ficha profesional</h1>
        <p className="mt-1 mb-5 text-center text-sm text-tinta-500">
          Tu cuenta es tuya: solo tú puedes editar y publicar tu ficha profesional.
        </p>
        <FormularioRegistro chipCodigo={chipCodigo} />
      </Contenido>
    </>
  );
}
