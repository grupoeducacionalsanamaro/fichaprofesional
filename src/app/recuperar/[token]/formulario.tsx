"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { restablecerContrasena, type EstadoRestablecer } from "./acciones";

export function FormularioNuevaContrasena({ token }: { token: string }) {
  const [estado, accion, enviando] = useActionState<EstadoRestablecer, FormData>(
    restablecerContrasena,
    {},
  );

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      <input type="hidden" name="token" value={token} />

      <Campo etiqueta="Nueva contraseña" requerido>
        <Entrada name="contrasena" type="password" autoComplete="new-password" required minLength={8} autoFocus />
      </Campo>

      <Campo etiqueta="Confirma la contraseña" requerido>
        <Entrada name="confirmarContrasena" type="password" autoComplete="new-password" required minLength={8} />
      </Campo>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

      <Boton type="submit" cargando={enviando} tamano="grande" className="w-full">
        {enviando ? "Guardando…" : "Guardar nueva contraseña"}
      </Boton>
    </form>
  );
}
