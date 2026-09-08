"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Entrada, Rotulo } from "@/components/ui";
import { vincularChip, type EstadoChip } from "./acciones";

export function FormularioChip({ codigoInicial }: { codigoInicial?: string | null }) {
  const [estado, accion, enviando] = useActionState<EstadoChip, FormData>(vincularChip, {});

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      <h2 className="border-b border-tinta-100 pb-3">
        <Rotulo>Vincular mi llavero NFC</Rotulo>
      </h2>

      <Campo
        etiqueta="Código de tu llavero"
        requerido
        ayuda="El código impreso o detectado en tu llavero físico. Se vincula una sola vez y queda fijo a esta cuenta."
      >
        <Entrada
          name="codigo"
          defaultValue={codigoInicial ?? ""}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ej: K7QX2MRT"
          required
        />
      </Campo>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
      {estado.guardado && <Aviso tono="exito">¡Llavero vinculado con éxito!</Aviso>}

      <Boton type="submit" cargando={enviando}>
        {enviando ? "Vinculando…" : "Vincular llavero"}
      </Boton>
    </form>
  );
}
