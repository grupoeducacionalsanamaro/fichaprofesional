-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('BORRADOR', 'PUBLICADA');

-- CreateEnum
CREATE TYPE "TokenProposito" AS ENUM ('VERIFICAR_CORREO', 'RECUPERAR_CONTRASENA');

-- CreateTable
CREATE TABLE "Alumno" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "tituloProfesional" TEXT NOT NULL DEFAULT '',
    "numeroRegistroProfesional" TEXT,
    "fotoUrl" TEXT,
    "whatsapp" TEXT,
    "direccionConsultorio" TEXT,
    "horariosAtencion" TEXT,
    "bio" TEXT,
    "redesSociales" JSONB,
    "estadoPublicacion" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAcceso" (
    "id" TEXT NOT NULL,
    "alumnoId" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "proposito" "TokenProposito" NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_email_key" ON "Alumno"("email");

-- CreateIndex
CREATE INDEX "Alumno_estadoPublicacion_idx" ON "Alumno"("estadoPublicacion");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAcceso_jti_key" ON "TokenAcceso"("jti");

-- CreateIndex
CREATE INDEX "TokenAcceso_alumnoId_proposito_idx" ON "TokenAcceso"("alumnoId", "proposito");

-- AddForeignKey
ALTER TABLE "TokenAcceso" ADD CONSTRAINT "TokenAcceso_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
