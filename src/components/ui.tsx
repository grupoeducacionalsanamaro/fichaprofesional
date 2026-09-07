import * as React from "react";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Botones
   Movimiento: se levantan 2px al pasar el cursor y se hunden al presionar —
   el gesto de una tecla, no una animación decorativa. Con `prefers-reduced-
   motion` el desplazamiento se anula (clase `movimiento-hover`) y solo cambia
   el color.
   -------------------------------------------------------------------------- */

const BASE_BOTON =
  "movimiento-hover group/boton relative inline-flex select-none items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold tracking-tight " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out " +
  "active:translate-y-px active:scale-[0.985] " +
  "disabled:pointer-events-none disabled:opacity-45";

const VARIANTES = {
  primario:
    "bg-petroleo-600 text-white shadow-boton hover:-translate-y-0.5 hover:bg-petroleo-500 hover:shadow-elevada",
  secundario:
    "border border-tinta-200 bg-superficie text-tinta-900 shadow-tarjeta hover:-translate-y-0.5 hover:border-tinta-300 hover:bg-tinta-50 hover:shadow-elevada",
  sutil: "text-tinta-600 hover:bg-tinta-100 hover:text-tinta-900",
  peligro:
    "border border-error-600/25 bg-superficie text-error-700 hover:-translate-y-0.5 hover:border-error-600/50 hover:bg-error-50",
} as const;

const TAMANOS = {
  normal: "min-h-11",
  grande: "min-h-13 px-6 text-[15px]",
} as const;

export function Boton({
  className,
  variante = "primario",
  tamano = "normal",
  cargando = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> & {
  variante?: keyof typeof VARIANTES;
  tamano?: keyof typeof TAMANOS;
  /** Muestra un indicador de proceso y bloquea el botón. */
  cargando?: boolean;
}) {
  return (
    <button
      aria-busy={cargando || undefined}
      disabled={disabled || cargando}
      className={cn(BASE_BOTON, VARIANTES[variante], TAMANOS[tamano], className)}
      {...props}
    >
      {cargando && <Girador />}
      {children}
    </button>
  );
}

export function Girador({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-4 shrink-0 animate-girar rounded-full border-2 border-current border-t-transparent opacity-70",
        className,
      )}
    />
  );
}

/* --------------------------------------------------------------------------
   Campos de formulario
   -------------------------------------------------------------------------- */

export function Campo({
  etiqueta,
  ayuda,
  children,
  requerido,
  htmlFor,
}: {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const Contenedor = htmlFor ? "div" : "label";
  const Texto = htmlFor ? "label" : "span";
  return (
    <Contenedor className="block">
      <Texto
        {...(htmlFor ? { htmlFor } : {})}
        className="mb-1.5 block text-sm font-semibold text-tinta-800"
      >
        {etiqueta}
        {requerido && (
          <span className="text-laton-600" aria-hidden>
            {" "}
            *
          </span>
        )}
      </Texto>
      {children}
      {ayuda && <span className="mt-1.5 block text-xs text-tinta-500">{ayuda}</span>}
    </Contenedor>
  );
}

const BASE_CONTROL =
  "w-full min-h-11 rounded-control border border-tinta-200 bg-superficie px-3.5 text-base text-tinta-900 " +
  "shadow-[0_1px_2px_rgb(14_34_38/0.04)] transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-tinta-400 hover:border-tinta-300 " +
  "focus:border-petroleo-400 focus:outline-none focus:ring-4 focus:ring-petroleo-100";

export function Entrada({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(BASE_CONTROL, className)} {...props} />;
}

export function AreaTexto({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(BASE_CONTROL, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

/** Casilla de verificación con marca propia — la nativa no acepta estilos. */
export function Casilla({
  className,
  children,
  ...props
}: React.ComponentProps<"input"> & { children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer gap-3 text-[15px] leading-relaxed text-tinta-800">
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" className={cn("peer sr-only", className)} {...props} />
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-lg border-2 border-tinta-300 bg-superficie transition-all duration-150 peer-hover:border-petroleo-400 peer-checked:border-petroleo-600 peer-checked:bg-petroleo-600 peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-laton-500"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="size-4 scale-50 text-white opacity-0 transition-all duration-150"
          >
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span>{children}</span>
    </label>
  );
}

/* --------------------------------------------------------------------------
   Indicadores
   -------------------------------------------------------------------------- */

const TONOS_ETIQUETA = {
  neutro: "bg-tinta-100 text-tinta-700 ring-tinta-200",
  acento: "bg-laton-100 text-laton-700 ring-laton-300/60",
  alerta: "bg-alerta-50 text-alerta-700 ring-alerta-700/20",
  exito: "bg-exito-50 text-exito-700 ring-exito-700/20",
  petroleo: "bg-petroleo-50 text-petroleo-700 ring-petroleo-400/25",
} as const;

export function Etiqueta({
  children,
  tono = "neutro",
}: {
  children: React.ReactNode;
  tono?: keyof typeof TONOS_ETIQUETA;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-rotulo text-[11px] font-semibold uppercase tracking-[0.09em] ring-1 ring-inset",
        TONOS_ETIQUETA[tono],
      )}
    >
      {children}
    </span>
  );
}

const TONOS_AVISO = {
  info: "bg-tinta-100 text-tinta-700 ring-tinta-200",
  error: "bg-error-50 text-error-700 ring-error-600/20",
  exito: "bg-exito-50 text-exito-700 ring-exito-700/20",
} as const;

export function Aviso({
  tono = "info",
  children,
}: {
  tono?: keyof typeof TONOS_AVISO;
  children: React.ReactNode;
}) {
  return (
    <p
      role={tono === "error" ? "alert" : undefined}
      className={cn(
        "animate-surgir rounded-control px-4 py-3 text-sm leading-relaxed ring-1 ring-inset",
        TONOS_AVISO[tono],
      )}
    >
      {children}
    </p>
  );
}

/** Rótulo en versalitas angostas: la voz de los datos de una credencial. */
export function Rotulo({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-rotulo text-[11px] font-semibold uppercase tracking-[0.16em] text-tinta-400",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
