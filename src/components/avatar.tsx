import Image from "next/image";
import { cn, iniciales } from "@/lib/utils";

export function Avatar({
  nombre,
  fotoUrl,
  tamano = 72,
  className,
}: {
  nombre: string;
  fotoUrl?: string | null;
  tamano?: number;
  className?: string;
}) {
  const clases = cn(
    "shrink-0 overflow-hidden rounded-[28%] object-cover ring-1 ring-tinta-900/10",
    className,
  );

  if (fotoUrl) {
    return (
      <Image
        src={fotoUrl}
        alt={`Fotografía de ${nombre}`}
        width={tamano}
        height={tamano}
        className={clases}
        style={{ width: tamano, height: tamano }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        clases,
        "flex items-center justify-center bg-gradient-to-br from-petroleo-500 to-petroleo-700 font-bold tracking-tight text-laton-200",
      )}
      style={{ width: tamano, height: tamano, fontSize: tamano / 2.9 }}
    >
      {iniciales(nombre)}
    </span>
  );
}
