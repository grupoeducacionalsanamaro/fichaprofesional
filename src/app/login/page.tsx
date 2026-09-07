import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { Cabecera, Contenido } from "@/components/marco";
import { FormularioAcceso } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Iniciar sesión", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: PageProps<"/login">) {
  if (await sesionActual()) redirect("/panel");
  const { error } = await searchParams;

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <h1 className="text-[1.65rem] font-bold tracking-tight">Inicia sesión</h1>
        <p className="mt-1 mb-5 text-sm text-tinta-500">Entra para editar tu ficha profesional.</p>
        <FormularioAcceso errorSesion={error === "sesion"} />
      </Contenido>
    </>
  );
}
