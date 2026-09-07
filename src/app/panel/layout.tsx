import Image from "next/image";
import Link from "next/link";
import { requerirProfesional } from "@/lib/auth";
import { NavegacionPanel } from "./navegacion";
import { salir } from "./acciones";

export const dynamic = "force-dynamic";

export default async function LayoutPanel({ children }: LayoutProps<"/panel">) {
  // Toda página bajo este layout exige sesión; cada acción de escritura la
  // vuelve a exigir por su cuenta.
  const profesionalId = await requerirProfesional();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-tinta-200/70 bg-superficie/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <Link href="/panel" className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="" aria-hidden width={36} height={36} className="h-9 w-9 shrink-0" />
            <span className="min-w-0">
              <span className="block font-rotulo text-[10px] font-semibold uppercase tracking-[0.18em] text-tinta-500">
                Mi cuenta
              </span>
              <span className="block truncate text-[15px] font-bold tracking-tight text-tinta-900">
                Panel del profesional
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={`/ficha/${profesionalId}`}
              className="hidden font-semibold text-petroleo-500 underline sm:inline"
            >
              Ver mi ficha pública
            </Link>
            <form action={salir}>
              <button className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-tinta-600 transition-colors hover:bg-tinta-100 hover:text-tinta-900">
                Salir
              </button>
            </form>
          </div>
        </div>
        <NavegacionPanel />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-7">{children}</main>
    </>
  );
}
