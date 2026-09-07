# Directorio de Alumnos — Grupo Educacional San Amaro

Ficha profesional de contacto para alumnos y egresados del holding: cada persona crea su propia
cuenta, edita su ficha y decide cuándo publicarla, y la comparte con un enlace directo
(`/ficha/[id]`). **No hay un listado ni un buscador público** — no existe una página que muestre
"todas las fichas": cada una vive sola, para compartirse de a una, igual que una tarjeta de
presentación. A diferencia de
[`APP LLAVEROS SAN AMARO`](../APP%20LLAVEROS%20SAN%20AMARO) (directorio de colaboradores, gestionado
por RR.HH.), aquí tampoco hay panel de administración ni datos de institución: es una ficha de
contacto profesional (nombre, título, foto, contacto, consultorio, redes) autogestionada de punta
a punta por su titular.

Nace como copia de esa misma base de código, adaptada para otro público. Comparten el mismo stack
y componentes visuales, pero son proyectos independientes: **repositorio y base de datos propios**.

---

## Stack

| Pieza | Elección |
|---|---|
| Framework | Next.js 16.3 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 (tokens en `globals.css`, mismo sistema visual "credencial" del holding) |
| Base de datos | PostgreSQL — **separada** de la de colaboradores (Vercel Postgres o Neon) |
| ORM | Prisma 7 (`prisma-client` + driver adapter `@prisma/adapter-pg`) |
| Fotos | Vercel Blob |
| Email | Resend (verificación de correo y recuperación de contraseña) |
| Autenticación | Cada alumno se registra con su propio correo y contraseña (scrypt + cookie de sesión firmada). No hay usuarios de administración. |

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local && cp .env.example .env   # el CLI de Prisma lee .env; Next lee .env.local
```

Completa `DATABASE_URL` y los secretos, luego:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Si aún no tienes una base de datos, `npx prisma dev` levanta un Postgres local efímero e imprime
su cadena de conexión.

**Sin `RESEND_API_KEY`, los correos no se envían: el enlace queda impreso en el log del
servidor.** Es la forma prevista de recorrer el flujo completo en desarrollo.

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción (ejecuta `prisma generate` vía `postinstall`). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run db:migrate` | `prisma migrate deploy`. |
| `npm run db:seed` | Fichas DEMO ficticias (una publicada, una en borrador). |
| `npm run db:studio` | Prisma Studio. |

## Variables de entorno

Ver `.env.example`. `TOKEN_SECRET` y `SESSION_SECRET` deben tener **al menos 32 caracteres** —
genéralos con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

`APP_URL` es la URL pública base de esta app (sin basePath): el código la usa para construir los
enlaces de verificación y recuperación en los correos.

## Modelo de datos

`prisma/schema.prisma`. Un solo modelo de negocio, `Alumno` (cuenta + ficha en la misma fila,
porque el titular de la cuenta es siempre el titular de la ficha), más `TokenAcceso` para los
enlaces de un solo uso de verificación de correo y recuperación de contraseña.

### Regla de visibilidad

`src/lib/datos-publicos.ts` es la única vía por la que la parte pública consulta la base, con un
`select` explícito y positivo. Solo se expone lo que la propia persona escribió para publicar. El
campo `email` (el correo de acceso a la cuenta) **nunca** está en ese `select`: el botón de
contacto de la ficha pública usa `correoContacto`, un campo aparte y opcional que el alumno decide
si completa. Los demás campos ausentes son los internos de la cuenta — `passwordHash` y
`emailVerificado`. Su única función, `obtenerFichaPublica(id)`, lee una ficha por su id exacto — no
existe un listado ni una búsqueda sobre la tabla `Alumno` desde la capa pública.

## Rutas

| Ruta | Acceso | Qué es |
|---|---|---|
| `/` | Público | Landing: explica la app y lleva a crear cuenta / iniciar sesión (o a "Mi panel" si ya hay sesión). |
| `/ficha/[id]` | Público | Ficha individual, accesible solo por enlace directo. 404 si no existe **o** no está publicada. |
| `/registro` | Público | Crear cuenta (nombre, correo, contraseña). Inicia sesión automáticamente. |
| `/login` | Público | Inicio de sesión. |
| `/recuperar`, `/recuperar/[token]` | Público | Recuperación de contraseña por correo. |
| `/verificar/[token]` | Público (con token) | Confirma el correo de la cuenta. |
| `/panel` | Sesión propia | Editar la ficha, subir foto, publicar/retirar del directorio. |
| `/panel/cuenta` | Sesión propia | Reenviar verificación, cambiar contraseña, eliminar la cuenta. |

## Flujo funcional

```
Alumno se registra (correo + contraseña) → sesión abierta automáticamente
      ↓
Completa su ficha en /panel (foto, título, contacto, redes sociales)
      ↓
Confirma su correo (enlace de un solo uso, 3 días)
      ↓
Publica su propia ficha desde /panel → visible en /ficha/[id], su enlace estable
      ↓
Puede retirarla o editarla en cualquier momento — sin revisión de terceros
```

No existe un rol de administrador: cada persona es la única que puede editar, publicar, retirar
o eliminar su propia ficha. Publicar exige correo verificado, nombre y título profesional
completos; el servidor revalida esa condición en cada intento, no solo la interfaz.

### Eliminar la cuenta

`Retirar del directorio` (pasa a borrador, conserva los datos) y `Eliminar mi cuenta` (borra fila,
tokens y fotografía del blob, irreversible) son acciones distintas, igual que en el directorio de
colaboradores. Eliminar exige escribir `ELIMINAR`, revalidado también en el servidor.

## Indexación

A diferencia del directorio de colaboradores (pensado como credencial NFC privada, sin indexar),
esta ficha es un perfil profesional que cada persona publica **para que la encuentren**: se
permite la indexación en buscadores, salvo las rutas de cuenta (`/panel`, `/login`, `/registro`,
`/recuperar`, `/verificar`).

## Desviaciones respecto del proyecto original (`APP LLAVEROS SAN AMARO`)

Documentadas aquí porque el código parte de esa misma base y varias piezas que tenían sentido para
RR.HH. gestionando trabajadores no aplican a un directorio autogestionado:

1. **Sin panel de administración ni invitaciones.** El alumno se registra solo; no hay un tercero
   que lo invite, apruebe su ficha ni la edite en su nombre. Por eso tampoco existen
   `RegistroEdicion` ni `RegistroSupresion`: no hay una segunda parte cuyas acciones haya que
   auditar frente al titular.
2. **Sin datos de institución.** No hay `MarcaInstituto`, `área`, `sede` ni `cargo`: la ficha es
   un perfil profesional independiente del holding, no un registro de dotación.
3. **Sin listado ni búsqueda pública.** El original tenía un directorio navegable con filtros; acá
   no existe esa vista ni la consulta que la respalda (`listarDirectorio` fue eliminada de
   `src/lib/datos-publicos.ts`). Cada ficha se comparte por su propio enlace, no se descubre
   navegando. La home (`/`) es una landing que lleva a crear cuenta o iniciar sesión.
4. **Campos nuevos para un perfil profesional**: título profesional, número de registro/colegiado,
   dirección de consultorio, horarios de atención y enlaces a redes sociales (plataforma + URL
   libres, sin lista fija).
5. **Verificación de correo y recuperación de contraseña**, ausentes en el original porque las
   cuentas de RR.HH. se gestionaban a mano vía variable de entorno. Aquí son parte central del
   autoservicio.
6. **Rate limit e infraestructura (Blob, Resend, sesión firmada) reutilizados sin cambios** desde
   el proyecto de colaboradores — ver los mismos archivos en `src/lib/`.

## Pasos manuales pendientes

1. **Crear el proyecto en Vercel** (independiente del de colaboradores) y conectar este
   repositorio, ya inicializado como su propio git.
2. **Provisionar una base de datos separada** (Vercel Postgres o Neon), cargar `DATABASE_URL` y
   correr `npx prisma migrate deploy` + `npx prisma db seed`.
3. **Cargar las variables de entorno** en Vercel, incluida `APP_URL` con el dominio final.
4. **Verificar el dominio remitente en Resend** y ajustar `EMAIL_FROM`.
5. **Definir el dominio/subpath final** (dominio propio, subdominio, o subpath de `sanamaro.cl`
   mediante Routing Rule como hace `/colaboradores`) y fijar `basePath` en `next.config.ts` si
   corresponde.
6. **Borrar las fichas DEMO** antes de producción:
   `DELETE FROM "Alumno" WHERE "email" LIKE '%@demo.sanamaro.cl';`

## Fuera de alcance de v1

Moderación o revisión de fichas por un tercero · verificación del número de registro profesional
contra un colegio real · más de una cuenta por persona · credencial física NFC.
