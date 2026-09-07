import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Rotulo } from "@/components/ui";
import type { FichaPublica, RedSocial } from "@/lib/datos-publicos";
import { obtenerTemaFicha, type TEMAS_FICHA } from "@/lib/temas-ficha";
import { cn, telefonoAWhatsapp } from "@/lib/utils";

type Tema = (typeof TEMAS_FICHA)[number];

function redesSociales(valor: FichaPublica["redesSociales"]): RedSocial[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(
    (r): r is RedSocial =>
      typeof r === "object" && r !== null && typeof (r as RedSocial).plataforma === "string" && typeof (r as RedSocial).url === "string",
  );
}

/** Cabecera de la ficha: foto, nombre y título profesional sobre el color elegido por el profesional. */
function Encabezado({ ficha, tema }: { ficha: FichaPublica; tema: Tema }) {
  return (
    <div
      className="flex items-center gap-4 border-b-2 p-5"
      style={{ backgroundColor: tema.primario, borderColor: tema.acento }}
    >
      <Avatar nombre={ficha.nombreCompleto} fotoUrl={ficha.fotoUrl} tamano={80} />
      <div className="min-w-0">
        <h2 className="truncate text-[1.4rem] font-bold leading-tight tracking-tight text-white">
          {ficha.nombreCompleto}
        </h2>
        <p className="mt-0.5 truncate text-[15px] text-white/75">{ficha.tituloProfesional}</p>
      </div>
    </div>
  );
}

/** Acciones de contacto — lo primero accionable al abrir la ficha. */
export function AccionesContacto({ ficha, tema }: { ficha: FichaPublica; tema: Tema }) {
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
          style={{ backgroundColor: tema.boton }}
          className="movimiento-hover group/accion flex min-h-18 flex-col items-center justify-center gap-1.5 rounded-control px-2 text-sm font-semibold text-white shadow-boton transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-elevada active:translate-y-px active:scale-[0.985] active:brightness-95"
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

function BotonesRedes({ redes, tema }: { redes: RedSocial[]; tema: Tema }) {
  if (redes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {redes.map((red) => (
        <a
          key={`${red.plataforma}-${red.url}`}
          href={red.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ "--tema-borde-hover": tema.boton } as React.CSSProperties}
          className="movimiento-hover inline-flex min-h-10 items-center gap-1.5 rounded-control border border-tinta-200 bg-superficie px-3.5 text-sm font-semibold text-tinta-800 shadow-tarjeta transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--tema-borde-hover)] hover:shadow-elevada"
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
  const tema = obtenerTemaFicha(ficha.temaFicha);

  return (
    <article className="animate-surgir overflow-hidden rounded-tarjeta bg-superficie shadow-tarjeta ring-1 ring-tinta-200/70">
      <Encabezado ficha={ficha} tema={tema} />

      <div className="p-5">
        <AccionesContacto ficha={ficha} tema={tema} />

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
                  style={{ color: tema.boton, textDecorationColor: tema.acento }}
                  className="break-all underline decoration-2 underline-offset-4 transition-opacity hover:opacity-80"
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
            <BotonesRedes redes={redes} tema={tema} />
          </div>
        )}
      </div>

      <p className="flex items-center justify-between gap-2 border-t border-tinta-100 bg-tinta-50 px-5 py-3">
        <Rotulo>Profesional · Grupo San Amaro</Rotulo>
        <Rotulo className="text-tinta-300">{ficha.id.slice(-6).toUpperCase()}</Rotulo>
      </p>
    </article>
  );
}
