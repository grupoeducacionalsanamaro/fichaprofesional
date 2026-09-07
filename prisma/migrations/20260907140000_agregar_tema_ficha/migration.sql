-- CreateEnum
CREATE TYPE "TemaFicha" AS ENUM ('PETROLEO', 'BURDEOS', 'MARINO', 'BOSQUE', 'GRAFITO');

-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN "temaFicha" "TemaFicha" NOT NULL DEFAULT 'PETROLEO';
