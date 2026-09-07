import Link from "next/link";
import { requerirAlumno } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Aviso, Boton, Rotulo } from "@/components/ui";
import { FormularioFicha } from "./formulario-ficha";
import { alternarPublicacion } from "./acciones-ficha";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi ficha", robots: { index: false, follow: false } };

export default async function PanelFicha() {
  const alumnoId = await requerirAlumno();
  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: {
      nombreCompleto: true,
      email: true,
      emailVerificado: true,
      tituloProfesional: true,
      numeroRegistroProfesional: true,
      fotoUrl: true,
      whatsapp: true,
      direccionConsultorio: true,
      horariosAtencion: true,
      bio: true,
      redesSociales: true,
      estadoPublicacion: true,
    },
  });

  const publicada = alumno.estadoPublicacion === "PUBLICADA";
  const puedePublicar = alumno.emailVerificado && alumno.nombreCompleto.trim() && alumno.tituloProfesional.trim();

  return (
    <div className="space-y-5">
      <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Rotulo>Estado de publicación</Rotulo>
            <p className="mt-1 text-lg font-bold tracking-tight text-tinta-900">
              {publicada ? "Publicada en el directorio" : "Borrador — no visible al público"}
            </p>
          </div>
          <form action={alternarPublicacion}>
            <Boton type="submit" variante={publicada ? "secundario" : "primario"} disabled={!publicada && !puedePublicar}>
              {publicada ? "Retirar del directorio" : "Publicar mi ficha"}
            </Boton>
          </form>
        </div>

        {!alumno.emailVerificado && (
          <div className="mt-4">
            <Aviso tono="info">
              Confirma tu correo para poder publicar tu ficha.{" "}
              <Link href="/panel/cuenta" className="font-semibold underline">
                Reenviar correo de verificación
              </Link>
            </Aviso>
          </div>
        )}
      </section>

      <FormularioFicha alumno={alumno} />
    </div>
  );
}
