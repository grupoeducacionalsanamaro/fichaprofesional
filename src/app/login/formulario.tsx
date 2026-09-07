"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { entrar, type EstadoAcceso } from "./acciones";

export function FormularioAcceso({ errorSesion }: { errorSesion: boolean }) {
  const [estado, accion, entrando] = useActionState<EstadoAcceso, FormData>(entrar, {});
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <form
      action={accion}
      className="space-y-4 rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70"
    >
      {errorSesion && (
        <Aviso tono="info">Tu sesión expiró. Vuelve a ingresar para continuar.</Aviso>
      )}

      <Campo etiqueta="Correo electrónico" requerido>
        <Entrada
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={estado.email ?? ""}
          required
          autoFocus
        />
      </Campo>

      <Campo etiqueta="Contraseña" requerido>
        <div className="relative">
          <Entrada
            name="contrasena"
            type={verContrasena ? "text" : "password"}
            autoComplete="current-password"
            required
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

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

      <Boton type="submit" cargando={entrando} tamano="grande" className="w-full">
        {entrando ? "Entrando…" : "Iniciar sesión"}
      </Boton>

      <div className="flex items-center justify-between text-sm">
        <Link href="/recuperar" className="font-semibold text-petroleo-500 underline">
          Olvidé mi contraseña
        </Link>
        <Link href="/registro" className="font-semibold text-petroleo-500 underline">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
