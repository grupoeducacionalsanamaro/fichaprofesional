import Link from "next/link";
import { Aviso } from "@/components/ui";
import { Cabecera, Contenido } from "@/components/marco";
import { validarTokenRecuperacion } from "@/lib/tokens-acceso";
import { FormularioNuevaContrasena } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Elige tu nueva contraseña", robots: { index: false, follow: false } };

export default async function RecuperarConToken({ params }: PageProps<"/recuperar/[token]">) {
  const { token } = await params;
  const fila = await validarTokenRecuperacion(token);

  if (!fila) {
    return (
      <>
        <Cabecera />
        <Contenido className="max-w-md">
          <Aviso tono="error">
            Este enlace no es válido, ya fue utilizado o venció. Los enlaces de recuperación duran
            2 horas y solo pueden usarse una vez.
          </Aviso>
          <p className="mt-4 text-sm">
            <Link href="/recuperar" className="font-semibold text-petroleo-500 underline">
              Solicitar un enlace nuevo
            </Link>
          </p>
        </Contenido>
      </>
    );
  }

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <h1 className="text-[1.65rem] font-bold tracking-tight">Elige tu nueva contraseña</h1>
        <p className="mt-1 mb-5 text-sm text-tinta-500">Mínimo 8 caracteres.</p>
        <FormularioNuevaContrasena token={token} />
      </Contenido>
    </>
  );
}
