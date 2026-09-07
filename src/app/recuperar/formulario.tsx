"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { solicitarRecuperacion, type EstadoSolicitud } from "./acciones";

export function FormularioSolicitar() {
  const [estado, accion, enviando] = useActionState<EstadoSolicitud, FormData>(solicitarRecuperacion, {});

  if (estado.enviado) {
    return (
      <Aviso tono="exito">
        Si ese correo tiene una cuenta, te enviamos un enlace para restablecer la contraseña.
        Revisa tu bandeja de entrada.
      </Aviso>
    );
  }

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      <Campo etiqueta="Correo electrónico" requerido>
        <Entrada name="email" type="email" autoComplete="email" required autoFocus />
      </Campo>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

      <Boton type="submit" cargando={enviando} tamano="grande" className="w-full">
        {enviando ? "Enviando…" : "Enviar enlace"}
      </Boton>
    </form>
  );
}
