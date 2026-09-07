"use client";

import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Aviso, Boton, Campo, Entrada, Rotulo } from "@/components/ui";
import { eliminarCuenta, type EstadoEliminar } from "./acciones";

/**
 * Eliminar es irreversible, así que está cerrado por defecto y exige escribir
 * ELIMINAR. La confirmación se valida además en el servidor.
 */
export function ZonaEliminar() {
  const [abierta, setAbierta] = useState(false);
  const [estado, accion, eliminando] = useActionState<EstadoEliminar, FormData>(eliminarCuenta, {});

  return (
    <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-error-600/20">
      <h2 className="mb-3 flex items-center gap-2 border-b border-error-600/15 pb-3">
        <AlertTriangle aria-hidden size={14} className="text-error-600" />
        <Rotulo className="text-error-600">Eliminar mi cuenta</Rotulo>
      </h2>

      <p className="text-sm leading-relaxed text-tinta-600">
        Borra de forma definitiva tu cuenta, tu ficha, tu fotografía y todos tus datos. No se puede
        deshacer. Si solo quieres dejar de aparecer en el directorio, usa{" "}
        <strong className="font-semibold text-tinta-800">Retirar del directorio</strong> en la
        pestaña Mi ficha: conserva tus datos y puedes volver a publicar cuando quieras.
      </p>

      {!abierta ? (
        <div className="mt-4">
          <Boton type="button" variante="peligro" onClick={() => setAbierta(true)}>
            Eliminar mi cuenta
          </Boton>
        </div>
      ) : (
        <form action={accion} className="mt-4 space-y-4 rounded-control bg-error-50/60 p-4">
          <Campo etiqueta="Escribe ELIMINAR para confirmar" requerido>
            <Entrada name="confirmacion" autoComplete="off" spellCheck={false} placeholder="ELIMINAR" required />
          </Campo>

          {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

          <div className="flex flex-wrap gap-2">
            <Boton type="submit" variante="peligro" cargando={eliminando}>
              {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
            </Boton>
            <Boton type="button" variante="sutil" onClick={() => setAbierta(false)}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}
    </section>
  );
}
