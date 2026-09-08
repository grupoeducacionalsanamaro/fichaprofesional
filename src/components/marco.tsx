import Image from "next/image";
import Link from "next/link";
import { sesionActual } from "@/lib/auth";
import { cn } from "@/lib/utils";

export async function Cabecera({ enlaceVolver }: { enlaceVolver?: boolean }) {
  const sesion = enlaceVolver ? await sesionActual() : null;
  return (
    <header className="sticky top-0 z-40 border-b border-tinta-200/70 bg-superficie/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group/marca flex min-w-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            aria-hidden
            width={40}
            height={40}
            priority
            className="h-10 w-10 shrink-0 transition-transform duration-200 group-hover/marca:scale-105"
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
          {enlaceVolver && sesion && (
            <Link
              href="/panel"
              className="rounded-lg px-2 py-1 text-sm font-semibold text-petroleo-500 transition-colors hover:bg-petroleo-50 hover:text-petroleo-700"
            >
              Volver a mi panel
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
        Cada ficha es publicada y editada por su propio titular. Creado por{" "}
        <a
          href="https://sanamaro.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-petroleo-500 underline"
        >
          Grupo Educacional San Amaro
        </a>
      </p>
    </footer>
  );
}
