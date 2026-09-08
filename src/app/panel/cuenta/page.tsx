import { requerirProfesional } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarCodigoChip } from "@/lib/chip-nfc";
import { Aviso, Boton, Rotulo } from "@/components/ui";
import { FormularioContrasena } from "./formulario-contrasena";
import { FormularioChip } from "./formulario-chip";
import { ZonaEliminar } from "./zona-eliminar";
import { reenviarVerificacion } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };

export default async function PanelCuenta({ searchParams }: PageProps<"/panel/cuenta">) {
  const profesionalId = await requerirProfesional();
  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { id: profesionalId },
    select: { email: true, emailVerificado: true, chipNfc: { select: { codigo: true } } },
  });

  const { chip } = await searchParams;
  const codigoPrecargado = typeof chip === "string" ? normalizarCodigoChip(chip) : null;

  return (
    <div className="space-y-5">
      <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70">
        <Rotulo>Correo de la cuenta</Rotulo>
        <p className="mt-1 text-[15px] text-tinta-900">{profesional.email}</p>
        {profesional.emailVerificado ? (
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

      <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70">
        <Rotulo>Llavero NFC</Rotulo>
        {profesional.chipNfc ? (
          <div className="mt-3">
            <Aviso tono="exito">
              Tu llavero está vinculado y activo (código {profesional.chipNfc.codigo}).
            </Aviso>
          </div>
        ) : (
          <p className="mt-1 text-sm text-tinta-500">
            Aún no tienes un llavero vinculado a esta cuenta.
          </p>
        )}
      </section>

      {!profesional.chipNfc && <FormularioChip codigoInicial={codigoPrecargado} />}

      <FormularioContrasena />
      <ZonaEliminar />
    </div>
  );
}
