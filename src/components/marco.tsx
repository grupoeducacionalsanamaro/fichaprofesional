import Link from "next/link";
import { cn } from "@/lib/utils";

export function Cabecera({ enlaceVolver }: { enlaceVolver?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-tinta-200/70 bg-superficie/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group/marca flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="h-9 w-1.5 shrink-0 rounded-full bg-laton-500 transition-all duration-200 group-hover/marca:h-10"
          />
          <span className="min-w-0">
            <span className="block truncate font-rotulo text-[10px] font-semibold uppercase tracking-[0.18em] text-tinta-500">
              Grupo Educacional San Amaro
            </span>
            <span className="block truncate text-[15px] font-bold tracking-tight text-tinta-900">
              Directorio de Profesionales
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {enlaceVolver && (
            <Link
              href="/"
              className="rounded-lg px-2 py-1 text-sm font-semibold text-petroleo-500 transition-colors hover:bg-petroleo-50 hover:text-petroleo-700"
            >
              Inicio
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Contenido({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-3xl flex-1 px-4 py-6", className)}>{children}</main>
  );
}

export function PieDePagina() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4">
      <p className="border-t border-tinta-200 pt-4 text-xs leading-relaxed text-tinta-500">
        Cada ficha es publicada y editada por su propio titular.{" "}
        <Link href="/registro" className="font-semibold text-petroleo-500 underline">
          Crea la tuya
        </Link>{" "}
        o escribe a Grupo San Amaro si algo no corresponde.
      </p>
    </footer>
  );
}
