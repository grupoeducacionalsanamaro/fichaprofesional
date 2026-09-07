import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { Cabecera, Contenido } from "@/components/marco";
import { FormularioRegistro } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crea tu ficha", robots: { index: false, follow: false } };

export default async function Registro() {
  if (await sesionActual()) redirect("/panel");

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <h1 className="text-[1.65rem] font-bold tracking-tight">Crea tu ficha de alumno</h1>
        <p className="mt-1 mb-5 text-sm text-tinta-500">
          Tu cuenta es tuya: solo tú puedes editar y publicar tu ficha profesional.
        </p>
        <FormularioRegistro />
      </Contenido>
    </>
  );
}
