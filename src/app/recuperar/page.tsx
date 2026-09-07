import { Cabecera, Contenido } from "@/components/marco";
import { FormularioSolicitar } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };

export default function RecuperarContrasena() {
  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <h1 className="text-[1.65rem] font-bold tracking-tight">Recupera tu contraseña</h1>
        <p className="mt-1 mb-5 text-sm text-tinta-500">
          Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una nueva contraseña.
        </p>
        <FormularioSolicitar />
      </Contenido>
    </>
  );
}
