import Link from "next/link";
import { Cabecera, Contenido, PieDePagina } from "@/components/marco";

export const metadata = { title: "Ficha no disponible", robots: { index: false, follow: false } };

export default function NoEncontrada() {
  return (
    <>
      <Cabecera />
      <Contenido className="max-w-lg">
        <h1 className="text-2xl font-bold">Esta ficha no está disponible</h1>
        <p className="mt-2 text-tinta-700">
          El enlace puede estar equivocado, o la ficha aún no ha sido publicada o fue retirada por
          su titular.
        </p>
        <p className="mt-6">
          <Link href="/" className="font-semibold text-petroleo-500 underline">
            Ir al inicio
          </Link>
        </p>
      </Contenido>
      <PieDePagina />
    </>
  );
}
