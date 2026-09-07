import { requerirAlumno } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Aviso, Boton, Rotulo } from "@/components/ui";
import { FormularioContrasena } from "./formulario-contrasena";
import { ZonaEliminar } from "./zona-eliminar";
import { reenviarVerificacion } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };

export default async function PanelCuenta() {
  const alumnoId = await requerirAlumno();
  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: { email: true, emailVerificado: true },
  });

  return (
    <div className="space-y-5">
      <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70">
        <Rotulo>Correo de la cuenta</Rotulo>
        <p className="mt-1 text-[15px] text-tinta-900">{alumno.email}</p>
        {alumno.emailVerificado ? (
          <div className="mt-3">
            <Aviso tono="exito">Correo confirmado.</Aviso>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <Aviso tono="info">Aún no confirmas tu correo. Sin confirmarlo no puedes publicar tu ficha.</Aviso>
            <form action={reenviarVerificacion}>
              <Boton type="submit" variante="secundario">
                Reenviar correo de verificación
              </Boton>
            </form>
          </div>
        )}
      </section>

      <FormularioContrasena />
      <ZonaEliminar />
    </div>
  );
}
