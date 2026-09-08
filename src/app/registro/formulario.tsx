"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { registrarCuenta, type EstadoRegistro } from "./acciones";

export function FormularioRegistro({ chipCodigo }: { chipCodigo?: string | null }) {
  const [estado, accion, enviando] = useActionState<EstadoRegistro, FormData>(registrarCuenta, {});
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      {chipCodigo && (
        <>
          <input type="hidden" name="chip" value={chipCodigo} />
          <Aviso tono="info">
            Detectamos tu llavero NFC — se vinculará automáticamente a esta cuenta al crearla.
          </Aviso>
        </>
      )}

      <Campo etiqueta="Nombre completo" requerido>
        <Entrada
          name="nombreCompleto"
          defaultValue={estado.valores?.nombreCompleto ?? ""}
          required
          autoFocus
          maxLength={160}
        />
      </Campo>

      <Campo etiqueta="Correo electrónico" requerido ayuda="Con este correo inicias sesión y también se muestra como botón de contacto en tu ficha.">
        <Entrada
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={estado.valores?.email ?? ""}
          required
        />
      </Campo>

      <Campo etiqueta="Contraseña" requerido ayuda="Mínimo 8 caracteres.">
        <div className="relative">
          <Entrada
            name="contrasena"
            type={verContrasena ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setVerContrasena((v) => !v)}
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={verContrasena}
            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-tinta-500 transition-colors hover:bg-tinta-100 hover:text-tinta-800"
          >
            {verContrasena ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
          </button>
        </div>
      </Campo>

      <Campo etiqueta="Confirma tu contraseña" requerido>
        <Entrada
          name="confirmarContrasena"
          type={verContrasena ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Campo>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

      <Boton type="submit" cargando={enviando} tamano="grande" className="w-full">
        {enviando ? "Creando cuenta…" : "Crear mi cuenta"}
      </Boton>

      <p className="text-center text-sm text-tinta-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-petroleo-500 underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
