"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Entrada, Rotulo } from "@/components/ui";
import { cambiarContrasena, type EstadoContrasena } from "./acciones";

export function FormularioContrasena() {
  const [estado, accion, enviando] = useActionState<EstadoContrasena, FormData>(cambiarContrasena, {});

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      <h2 className="border-b border-tinta-100 pb-3">
        <Rotulo>Cambiar contraseña</Rotulo>
      </h2>

      <Campo etiqueta="Contraseña actual" requerido>
        <Entrada name="contrasenaActual" type="password" autoComplete="current-password" required />
      </Campo>
      <Campo etiqueta="Nueva contraseña" requerido ayuda="Mínimo 8 caracteres.">
        <Entrada name="contrasena" type="password" autoComplete="new-password" required minLength={8} />
      </Campo>
      <Campo etiqueta="Confirma la nueva contraseña" requerido>
        <Entrada name="confirmarContrasena" type="password" autoComplete="new-password" required minLength={8} />
      </Campo>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
      {estado.guardado && <Aviso tono="exito">Contraseña actualizada.</Aviso>}

      <Boton type="submit" cargando={enviando}>
        {enviando ? "Guardando…" : "Actualizar contraseña"}
      </Boton>
    </form>
  );
}
