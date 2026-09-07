import Link from "next/link";
import { Aviso } from "@/components/ui";
import { Cabecera, Contenido } from "@/components/marco";
import { prisma } from "@/lib/prisma";
import { validarTokenVerificacion, marcarTokenUsado } from "@/lib/tokens-acceso";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verificar correo", robots: { index: false, follow: false } };

export default async function VerificarCorreo({ params }: PageProps<"/verificar/[token]">) {
  const { token } = await params;
  const fila = await validarTokenVerificacion(token);

  if (!fila) {
    return (
      <>
        <Cabecera />
        <Contenido className="max-w-md">
          <Aviso tono="error">
            Este enlace no es válido, ya fue utilizado o venció. Puedes pedir uno nuevo desde tu
            panel.
          </Aviso>
          <p className="mt-4 text-sm">
            <Link href="/panel" className="font-semibold text-petroleo-500 underline">
              Ir a mi panel
            </Link>
          </p>
        </Contenido>
      </>
    );
  }

  await prisma.alumno.update({ where: { id: fila.alumnoId }, data: { emailVerificado: true } });
  await marcarTokenUsado(fila.id);

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-md">
        <Aviso tono="exito">Tu correo quedó confirmado. Ya puedes publicar tu ficha.</Aviso>
        <p className="mt-4 text-sm">
          <Link href="/panel" className="font-semibold text-petroleo-500 underline">
            Ir a mi panel
          </Link>
        </p>
      </Contenido>
    </>
  );
}
