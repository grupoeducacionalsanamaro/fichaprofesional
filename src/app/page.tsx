import Image from "next/image";
import Link from "next/link";
import { Boton } from "@/components/ui";
import { Cabecera, Contenido, PieDePagina } from "@/components/marco";
import { sesionActual } from "@/lib/auth";

// No hay directorio público que listar: cada ficha vive solo en su propio
// enlace (/ficha/[id]), compartido directamente por su titular. Esta página
// es una landing que dirige a crear cuenta, iniciar sesión o al panel propio.
export const dynamic = "force-dynamic";

export default async function Inicio() {
  const sesion = await sesionActual();

  return (
    <>
      <Cabecera />
      <Contenido className="max-w-lg">
        <div className="rounded-tarjeta bg-superficie p-6 text-center shadow-tarjeta ring-1 ring-tinta-200/70">
          <Image
            src="/logo.png"
            alt="Directorio de Profesionales — Grupo San Amaro"
            width={80}
            height={80}
            priority
            className="mx-auto h-20 w-20"
          />
          <h1 className="mt-4 text-[1.5rem] font-bold tracking-tight text-tinta-900">
            Tu ficha profesional, lista para compartir
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-600">
            Arma tu ficha de contacto profesional y compártela con un solo enlace.
            Tú decides qué muestra y cuándo publicarla.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            {sesion ? (
              <Link href="/panel">
                <Boton tamano="grande" className="w-full sm:w-auto sm:px-8">
                  Ir a mi panel
                </Boton>
              </Link>
            ) : (
              <Link href="/login">
                <Boton tamano="grande" className="w-full sm:w-auto sm:px-8">
                  Iniciar sesión
                </Boton>
              </Link>
            )}
          </div>

          {!sesion && (
            <p className="mt-4 text-sm text-tinta-500">
              ¿Tienes un llavero NFC del Grupo San Amaro? Tócalo con tu celular para activar tu cuenta.
            </p>
          )}
        </div>
      </Contenido>
      <PieDePagina />
    </>
  );
}
