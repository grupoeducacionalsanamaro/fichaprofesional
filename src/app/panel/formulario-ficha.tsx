"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { AreaTexto, Aviso, Boton, Campo, Entrada, Rotulo } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { guardarFicha, type EstadoFicha } from "./acciones-ficha";

type RedSocial = { plataforma: string; url: string };

type DatosAlumno = {
  nombreCompleto: string;
  email: string;
  tituloProfesional: string;
  especializacion: string | null;
  numeroRegistroProfesional: string | null;
  fotoUrl: string | null;
  whatsapp: string | null;
  correoContacto: string | null;
  direccionConsultorio: string | null;
  horariosAtencion: string | null;
  bio: string | null;
  redesSociales: unknown;
};

function redesIniciales(valor: unknown): RedSocial[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .filter((r): r is RedSocial => typeof r === "object" && r !== null && "plataforma" in r && "url" in r)
    .map((r) => ({ plataforma: String(r.plataforma ?? ""), url: String(r.url ?? "") }));
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-tarjeta bg-superficie p-5 shadow-tarjeta ring-1 ring-tinta-200/70">
      <h2 className="mb-4 border-b border-tinta-100 pb-3">
        <Rotulo>{titulo}</Rotulo>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FormularioFicha({ alumno }: { alumno: DatosAlumno }) {
  const [estado, accion, enviando] = useActionState<EstadoFicha, FormData>(guardarFicha, {});
  const [redes, setRedes] = useState<RedSocial[]>(() => redesIniciales(alumno.redesSociales));
  const [fotoElegida, setFotoElegida] = useState<{ nombre: string; previewUrl: string } | null>(null);
  const [ultimoGuardado, setUltimoGuardado] = useState(estado.guardado);

  const valor = (campo: string, original: string | null) => estado.valores?.[campo] ?? original ?? "";

  // Limpia el object URL de la vista previa al elegir otra foto o al salir del formulario.
  useEffect(() => {
    return () => {
      if (fotoElegida) URL.revokeObjectURL(fotoElegida.previewUrl);
    };
  }, [fotoElegida]);

  // Tras guardar con éxito, la foto ya quedó subida al servidor: la vista
  // previa local deja de ser necesaria (el avatar del encabezado se actualiza
  // con la URL real que llega en `alumno`). Ajuste durante el render, no en
  // un efecto: reacciona a un cambio de `estado`, no sincroniza con algo externo.
  if (estado.guardado !== ultimoGuardado) {
    setUltimoGuardado(estado.guardado);
    if (estado.guardado) setFotoElegida(null);
  }

  function alElegirFoto(archivo: File | undefined) {
    setFotoElegida(archivo ? { nombre: archivo.name, previewUrl: URL.createObjectURL(archivo) } : null);
  }

  return (
    <form action={accion} className="space-y-3">
      <section className="overflow-hidden rounded-tarjeta bg-superficie shadow-tarjeta ring-1 ring-tinta-200/70">
        <div className="flex items-center gap-4 border-b-2 border-laton-500 bg-petroleo-700 p-5">
          <Avatar
            nombre={alumno.nombreCompleto}
            fotoUrl={fotoElegida?.previewUrl ?? alumno.fotoUrl}
            tamano={64}
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-white">{alumno.nombreCompleto}</p>
            <p className="truncate text-[13px] text-laton-200">{alumno.email}</p>
          </div>
        </div>
        <div className="p-5">
          <Campo etiqueta="Fotografía profesional" ayuda="JPG, PNG o WEBP. Máximo 4 MB.">
            <input
              type="file"
              name="foto"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => alElegirFoto(e.target.files?.[0])}
              className="w-full cursor-pointer text-sm text-tinta-600 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-control file:border-0 file:bg-petroleo-50 file:px-4 file:text-sm file:font-semibold file:text-petroleo-700 file:transition-colors hover:file:bg-petroleo-100"
            />
          </Campo>
          {fotoElegida && (
            <p className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-exito-700">
              <CheckCircle2 aria-hidden size={16} />
              «{fotoElegida.nombre}» seleccionada — se sube al guardar cambios.
            </p>
          )}
        </div>
      </section>

      <Bloque titulo="Identificación">
        <Campo etiqueta="Nombre completo" requerido>
          <Entrada name="nombreCompleto" defaultValue={valor("nombreCompleto", alumno.nombreCompleto)} required maxLength={160} />
        </Campo>
        <Campo etiqueta="Título profesional" requerido>
          <Entrada name="tituloProfesional" defaultValue={valor("tituloProfesional", alumno.tituloProfesional)} required maxLength={120} />
        </Campo>
        <Campo etiqueta="Especialización" ayuda="Si tienes una especialización, indica cuál es.">
          <Entrada
            name="especializacion"
            defaultValue={valor("especializacion", alumno.especializacion)}
            maxLength={120}
          />
        </Campo>
        <Campo etiqueta="N° de registro profesional / colegiado" ayuda="Opcional.">
          <Entrada
            name="numeroRegistroProfesional"
            defaultValue={valor("numeroRegistroProfesional", alumno.numeroRegistroProfesional)}
            maxLength={60}
          />
        </Campo>
      </Bloque>

      <Bloque titulo="Cómo te contactan">
        <Campo etiqueta="WhatsApp Business" ayuda="Se mostrará como botón de contacto directo.">
          <Entrada name="whatsapp" defaultValue={valor("whatsapp", alumno.whatsapp)} maxLength={40} />
        </Campo>
        <Campo
          etiqueta="Correo electrónico institucional"
          ayuda="El correo al que el público podrá escribirte. En tu ficha pública se verá como «Correo electrónico»; es distinto del correo con el que iniciaste sesión, que nunca se muestra."
        >
          <Entrada
            name="correoContacto"
            type="email"
            defaultValue={valor("correoContacto", alumno.correoContacto)}
            maxLength={160}
          />
        </Campo>
        <Campo etiqueta="Dirección del consultorio">
          <Entrada
            name="direccionConsultorio"
            defaultValue={valor("direccionConsultorio", alumno.direccionConsultorio)}
            maxLength={200}
          />
        </Campo>
        <Campo etiqueta="Horarios de atención">
          <Entrada name="horariosAtencion" defaultValue={valor("horariosAtencion", alumno.horariosAtencion)} maxLength={200} />
        </Campo>
        <Campo etiqueta="Biografía breve" ayuda="Máximo 600 caracteres.">
          <AreaTexto name="bio" defaultValue={valor("bio", alumno.bio)} maxLength={600} />
        </Campo>
      </Bloque>

      <Bloque titulo="Redes sociales">
        <div className="space-y-3">
          {redes.map((red, indice) => (
            <div key={indice} className="flex items-end gap-2">
              <div className="w-32 shrink-0">
                <Campo etiqueta={indice === 0 ? "Plataforma" : ""}>
                  <Entrada
                    name="redPlataforma"
                    value={red.plataforma}
                    onChange={(e) =>
                      setRedes((r) => r.map((x, i) => (i === indice ? { ...x, plataforma: e.target.value } : x)))
                    }
                    placeholder="Instagram"
                    maxLength={40}
                  />
                </Campo>
              </div>
              <div className="flex-1">
                <Campo etiqueta={indice === 0 ? "Enlace" : ""}>
                  <Entrada
                    name="redUrl"
                    type="url"
                    value={red.url}
                    onChange={(e) =>
                      setRedes((r) => r.map((x, i) => (i === indice ? { ...x, url: e.target.value } : x)))
                    }
                    placeholder="https://…"
                  />
                </Campo>
              </div>
              <button
                type="button"
                onClick={() => setRedes((r) => r.filter((_, i) => i !== indice))}
                aria-label="Quitar red social"
                className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-control text-tinta-500 transition-colors hover:bg-error-50 hover:text-error-700"
              >
                <X aria-hidden size={18} />
              </button>
            </div>
          ))}
        </div>

        {redes.length < 8 && (
          <button
            type="button"
            onClick={() => setRedes((r) => [...r, { plataforma: "", url: "" }])}
            className="movimiento-hover flex min-h-10 items-center gap-1.5 rounded-control border border-dashed border-tinta-300 px-3.5 text-sm font-semibold text-tinta-600 transition-colors hover:border-petroleo-400 hover:text-petroleo-700"
          >
            <Plus aria-hidden size={16} />
            Agregar red social
          </button>
        )}
      </Bloque>

      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
      {estado.guardado && (
        <Aviso tono="exito">
          {estado.fotoActualizada ? "Ficha guardada. Tu foto se subió con éxito." : "Ficha guardada."}
        </Aviso>
      )}

      <Boton type="submit" cargando={enviando} tamano="grande" className="w-full">
        {enviando ? "Guardando…" : "Guardar cambios"}
      </Boton>
    </form>
  );
}
