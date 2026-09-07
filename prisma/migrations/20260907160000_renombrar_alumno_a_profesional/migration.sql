-- RenameTable
ALTER TABLE "Alumno" RENAME TO "Profesional";

-- RenameColumn
ALTER TABLE "TokenAcceso" RENAME COLUMN "alumnoId" TO "profesionalId";

-- RenameConstraint (primary key)
ALTER TABLE "Profesional" RENAME CONSTRAINT "Alumno_pkey" TO "Profesional_pkey";

-- RenameIndex
ALTER INDEX "Alumno_email_key" RENAME TO "Profesional_email_key";
ALTER INDEX "Alumno_estadoPublicacion_idx" RENAME TO "Profesional_estadoPublicacion_idx";
ALTER INDEX "TokenAcceso_alumnoId_proposito_idx" RENAME TO "TokenAcceso_profesionalId_proposito_idx";

-- RenameForeignKey
ALTER TABLE "TokenAcceso" RENAME CONSTRAINT "TokenAcceso_alumnoId_fkey" TO "TokenAcceso_profesionalId_fkey";
