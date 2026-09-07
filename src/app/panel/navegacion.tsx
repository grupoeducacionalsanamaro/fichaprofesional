"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/panel", texto: "Mi ficha" },
  { href: "/panel/cuenta", texto: "Cuenta" },
] as const;

export function NavegacionPanel() {
  const ruta = usePathname();

  return (
    <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pt-2">
      {NAV.map((item) => {
        const activo = item.href === "/panel" ? ruta === "/panel" : ruta.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "relative whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150",
              activo ? "text-tinta-900" : "text-tinta-500 hover:text-tinta-800",
            )}
          >
            {item.texto}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-all duration-200",
                activo ? "bg-laton-500" : "bg-transparent",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
