import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Rotulo } from "@/components/ui";
import type { FichaPublica, RedSocial } from "@/lib/datos-publicos";
import { cn, telefonoAWhatsapp } from "@/lib/utils";

function redesSociales(valor: FichaPublica["redesSociales"]): RedSocial[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(
    (r): r is RedSocial =>
      typeof r === "object" && r !== null && typeof (r as RedSocial).plataforma === "string" && typeof (r as RedSocial).url === "string",
  );
}

/** Cabecera de la ficha: foto, nombre y título profesional sobre fondo petróleo. */
function Encabezado({ ficha }: { ficha: FichaPublica }) {
  return (
    <div className="flex items-center gap-4 border-b-2 border-laton-500 bg-petroleo-700 p-5">
      <Avatar nombre={ficha.nombreCompleto} fotoUrl={ficha.fotoUrl} tamano={80} />
      <div className="min-w-0">
        <h2 className="truncate text-[1.4rem] font-bold leading-tight tracking-tight text-white">
          {ficha.nombreCompleto}
        </h2>
        <p className="mt-0.5 truncate text-[15px] text-laton-200">{ficha.tituloProfesional}</p>
      </div>
    </div>
  );
}

/** Acciones de contacto — lo primero accionable al abrir la ficha. */
export function AccionesContacto({ ficha }: { ficha: FichaPublica }) {
  const acciones = [
    ficha.whatsapp && {
      href: `https://wa.me/${telefonoAWhatsapp(ficha.whatsapp)}`,
      icono: MessageCircle,
      texto: "WhatsApp",
    },
    ficha.correoContacto && {
      href: `mailto:${ficha.correoContacto}`,
      icono: Mail,
      texto: "Correo",
    },
  ].filter(Boolean) as { href: string; icono: typeof Mail; texto: string }[];

  if (acciones.length === 0) return null;

  return (
    <div className={cn("grid gap-2", acciones.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {acciones.map(({ href, icono: Icono, texto }) => (
        <a
          key={texto}
          href={href}
          className="movimiento-hover group/accion flex min-h-18 flex-col items-center justify-center gap-1.5 rounded-control bg-petroleo-600 px-2 text-sm font-semibold text-white shadow-boton transition-[transform,background-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-petroleo-500 hover:shadow-elevada active:translate-y-px active:scale-[0.985]"
        >
          <Icono
            aria-hidden
            size={22}
            className="transition-transform duration-200 group-hover/accion:-translate-y-0.5"
          />
          {texto}
        </a>
      ))}
    </div>
  );
}

function BotonesRedes({ redes }: { redes: RedSocial[] }) {
  if (redes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {redes.map((red) => (
        <a
          key={`${red.plataforma}-${red.url}`}
          href={red.url}
          target="_blank"
          rel="noopener noreferrer"
          className="movimiento-hover inline-flex min-h-10 items-center gap-1.5 rounded-control border border-tinta-200 bg-superficie px-3.5 text-sm font-semibold text-tinta-800 shadow-tarjeta transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-petroleo-300 hover:shadow-elevada"
        >
          {red.plataforma}
          <ExternalLink aria-hidden size={14} className="text-tinta-400" />
        </a>
      ))}
    </div>
  );
}

function Dato({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  if (!valor) return null;
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-3 border-t border-tinta-100 py-2.5">
      <dt>
        <Rotulo>{rotulo}</Rotulo>
      </dt>
      <dd className="text-[15px] text-tinta-900">{valor}</dd>
    </div>
  );
}

/** Ficha individual completa. */
export function TarjetaFicha({ ficha }: { ficha: FichaPublica }) {
  const redes = redesSociales(ficha.redesSociales);
  return (
    <article className="animate-surgir overflow-hidden rounded-tarjeta bg-superficie shadow-tarjeta ring-1 ring-tinta-200/70">
      <Encabezado ficha={ficha} />

      <div className="p-5">
        <AccionesContacto ficha={ficha} />

        {ficha.bio && (
          <p className="mt-5 text-[15px] leading-relaxed text-tinta-700">{ficha.bio}</p>
        )}

        <dl className="mt-5">
          <Dato rotulo="Especialización" valor={ficha.especializacion} />
          <Dato rotulo="N° registro" valor={ficha.numeroRegistroProfesional} />
          <Dato rotulo="Consultorio" valor={ficha.direccionConsultorio} />
          <Dato rotulo="Horarios" valor={ficha.horariosAtencion} />
          <Dato
            rotulo="Correo electrónico"
            valor={
              ficha.correoContacto && (
                <a
                  className="break-all text-petroleo-500 underline decoration-laton-300 decoration-2 underline-offset-4 transition-colors hover:text-petroleo-700"
                  href={`mailto:${ficha.correoContacto}`}
                >
                  {ficha.correoContacto}
                </a>
              )
            }
          />
        </dl>

        {redes.length > 0 && (
          <div className="mt-5">
            <BotonesRedes redes={redes} />
          </div>
        )}
      </div>

      <p className="flex items-center justify-between gap-2 border-t border-tinta-100 bg-tinta-50 px-5 py-3">
        <Rotulo>Alumno · Grupo San Amaro</Rotulo>
        <Rotulo className="text-tinta-300">{ficha.id.slice(-6).toUpperCase()}</Rotulo>
      </p>
    </article>
  );
}
