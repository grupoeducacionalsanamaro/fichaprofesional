import { Link2, Search } from "lucide-react";
import Link from "next/link";
import { Boton, Entrada, Rotulo } from "@/components/ui";
import { TarjetaDirectorio } from "@/components/ficha";
import { Cabecera, Contenido, PieDePagina } from "@/components/marco";
import { listarDirectorio } from "@/lib/datos-publicos";

// Depende de la búsqueda por request y de datos que cambian al publicar una ficha.
export const dynamic = "force-dynamic";

function texto(valor: string | string[] | undefined) {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v?.trim() ? v.trim() : undefined;
}

export default async function Directorio({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = texto(params.q);

  const fichas = await listarDirectorio({ q });

  return (
    <>
      <Cabecera accionesAuth />
      <Contenido>
        <form
          className="rounded-tarjeta bg-superficie p-4 shadow-tarjeta ring-1 ring-tinta-200/70"
          role="search"
        >
          <div className="relative">
            <Search
              aria-hidden
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-400"
            />
            <Entrada
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre o título profesional"
              aria-label="Buscar alumno por nombre o título profesional"
              className="pl-11"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <Boton type="submit" className="flex-1 sm:flex-none sm:px-8">
              Buscar
            </Boton>
            {q && (
              <Link
                href="/"
                className="movimiento-hover inline-flex min-h-11 items-center justify-center rounded-control border border-tinta-200 bg-superficie px-4 text-sm font-semibold text-tinta-700 shadow-tarjeta transition-all duration-150 hover:-translate-y-0.5 hover:border-tinta-300 hover:bg-tinta-50"
              >
                Quitar búsqueda
              </Link>
            )}
          </div>
        </form>

        <p className="mt-6 mb-3" aria-live="polite">
          <Rotulo>
            {fichas.length === 0 ? "Sin resultados" : `${fichas.length} ${fichas.length === 1 ? "ficha" : "fichas"}`}
          </Rotulo>
        </p>

        {fichas.length === 0 ? (
          <div className="rounded-tarjeta border border-dashed border-tinta-300 bg-superficie/60 px-5 py-10 text-center">
            <p className="font-semibold text-tinta-800">Ninguna ficha coincide con la búsqueda</p>
            <p className="mt-1 text-sm text-tinta-500">
              Prueba con otro nombre o título, o quita la búsqueda para ver el directorio completo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fichas.map((ficha) => (
              <TarjetaDirectorio key={ficha.id} ficha={ficha} />
            ))}
          </div>
        )}

        <Link
          href="/registro"
          className="movimiento-hover mt-6 flex items-center justify-center gap-2 rounded-tarjeta border border-dashed border-petroleo-300 bg-petroleo-50 px-5 py-4 text-sm font-semibold text-petroleo-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-petroleo-400"
        >
          <Link2 aria-hidden size={16} />
          ¿Eres alumno o egresado? Crea tu ficha
        </Link>
      </Contenido>
      <PieDePagina />
    </>
  );
}
