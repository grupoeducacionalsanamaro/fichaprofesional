import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatearFecha(fecha: Date | null | undefined) {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es-CL", { year: "numeric", month: "long" }).format(fecha);
}

/** Deja solo dígitos y prefijo internacional, apto para un enlace wa.me. */
export function telefonoAWhatsapp(numero: string) {
  const soloDigitos = numero.replace(/[^\d]/g, "");
  return soloDigitos.startsWith("56") ? soloDigitos : `56${soloDigitos.replace(/^0+/, "")}`;
}
